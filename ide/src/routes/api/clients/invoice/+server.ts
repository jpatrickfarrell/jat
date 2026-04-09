/**
 * POST /api/clients/invoice
 *
 * Generate a Stripe invoice for a delivered milestone and send a combined
 * notification email to the client via Resend.
 *
 * Request body:
 * {
 *   projectKey: string,
 *   milestoneId: string,
 *   contractId: string,
 *   force?: boolean           // Override: generate even if invoice exists
 * }
 *
 * Flow:
 * 1. Fetch milestone + contract from project's Supabase
 * 2. Fetch approved contract_items (upsells/discounts) if table exists
 * 3. Calculate final amount = milestone amount + adjustments
 * 4. Create Stripe invoice with line items
 * 5. Send combined email: milestone summary + Loom embed + invoice link
 * 6. Update milestone with stripe_invoice_id
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProjectSecret } from '$lib/utils/credentials';
import Stripe from 'stripe';
import { Resend } from 'resend';

interface ContractItem {
	id: string;
	contract_id: string;
	type: 'upsell' | 'discount' | 'incentive';
	title: string;
	description: string | null;
	amount: number; // cents: positive = upsell, negative = discount
	status: string; // available | claimed | approved | rejected
	approved_at: string | null;
}

interface Milestone {
	id: string;
	contract_id: string;
	name: string;
	description: string | null;
	percentage: number;
	amount: number; // cents
	status: string;
	stripe_invoice_id: string | null;
	delivered_at: string | null;
	loom_url?: string | null;
}

interface Contract {
	id: string;
	title: string;
	total_amount: number;
	currency: string;
	status: string;
	client_email?: string | null;
	client_name?: string | null;
	stripe_customer_id?: string | null;
}

/**
 * Query a Supabase project's REST API
 */
async function supabaseQuery(
	supabaseUrl: string,
	serviceRoleKey: string,
	table: string,
	query: string = ''
): Promise<{ data: unknown[] | null; error: string | null }> {
	const url = `${supabaseUrl}/rest/v1/${table}${query ? '?' + query : ''}`;

	try {
		const response = await fetch(url, {
			headers: {
				'apikey': serviceRoleKey,
				'Authorization': `Bearer ${serviceRoleKey}`,
				'Content-Type': 'application/json',
				'Prefer': 'return=representation'
			}
		});

		if (!response.ok) {
			const text = await response.text();
			if (response.status === 404 || text.includes('does not exist')) {
				return { data: [], error: null };
			}
			return { data: null, error: `HTTP ${response.status}: ${text.slice(0, 200)}` };
		}

		const data = await response.json();
		return { data: Array.isArray(data) ? data : [], error: null };
	} catch (err) {
		return { data: null, error: (err as Error).message };
	}
}

/**
 * Update rows in a Supabase project's REST API
 */
async function supabaseUpdate(
	supabaseUrl: string,
	serviceRoleKey: string,
	table: string,
	query: string,
	updates: Record<string, unknown>
): Promise<{ data: unknown[] | null; error: string | null }> {
	const url = `${supabaseUrl}/rest/v1/${table}?${query}`;

	try {
		const response = await fetch(url, {
			method: 'PATCH',
			headers: {
				'apikey': serviceRoleKey,
				'Authorization': `Bearer ${serviceRoleKey}`,
				'Content-Type': 'application/json',
				'Prefer': 'return=representation'
			},
			body: JSON.stringify(updates)
		});

		if (!response.ok) {
			const text = await response.text();
			return { data: null, error: `HTTP ${response.status}: ${text.slice(0, 200)}` };
		}

		const data = await response.json();
		return { data: Array.isArray(data) ? data : [data], error: null };
	} catch (err) {
		return { data: null, error: (err as Error).message };
	}
}

function formatCents(cents: number, currency: string = 'usd'): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency.toUpperCase()
	}).format(cents / 100);
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { projectKey, milestoneId, contractId, force } = body;

	if (!projectKey || !milestoneId || !contractId) {
		return json({ error: 'projectKey, milestoneId, and contractId are required' }, { status: 400 });
	}

	// Get project credentials
	const supabaseUrl = getProjectSecret(projectKey, 'supabase_url');
	const serviceRoleKey = getProjectSecret(projectKey, 'supabase_service_role_key');
	const stripeSecretKey = getProjectSecret(projectKey, 'stripe-secret-key');
	const resendApiKey = getProjectSecret(projectKey, 'resend-api-key');

	if (!supabaseUrl || !serviceRoleKey) {
		return json({ error: `Missing Supabase credentials for project "${projectKey}"` }, { status: 400 });
	}

	if (!stripeSecretKey) {
		return json({ error: `Missing Stripe secret key for project "${projectKey}". Add it in Settings > Projects.` }, { status: 400 });
	}

	// 1. Fetch milestone
	const milestoneResult = await supabaseQuery(
		supabaseUrl, serviceRoleKey, 'milestones',
		`select=*&id=eq.${milestoneId}`
	);

	if (milestoneResult.error || !milestoneResult.data?.length) {
		return json({ error: `Milestone not found: ${milestoneResult.error || 'no data'}` }, { status: 404 });
	}

	const milestone = milestoneResult.data[0] as Milestone;

	// Check if already invoiced
	if (milestone.stripe_invoice_id && !force) {
		return json({
			error: 'Milestone already has an invoice',
			stripe_invoice_id: milestone.stripe_invoice_id
		}, { status: 409 });
	}

	// Milestone must be delivered or later
	if (milestone.status === 'pending') {
		return json({ error: 'Cannot invoice a pending milestone. Mark as delivered first.' }, { status: 400 });
	}

	// 2. Fetch contract
	const contractResult = await supabaseQuery(
		supabaseUrl, serviceRoleKey, 'contracts',
		`select=*&id=eq.${contractId}`
	);

	if (contractResult.error || !contractResult.data?.length) {
		return json({ error: `Contract not found: ${contractResult.error || 'no data'}` }, { status: 404 });
	}

	const contract = contractResult.data[0] as Contract;

	// 3. Fetch approved contract_items (upsells/discounts) — table may not exist
	let contractItems: ContractItem[] = [];
	const itemsResult = await supabaseQuery(
		supabaseUrl, serviceRoleKey, 'contract_items',
		`select=*&contract_id=eq.${contractId}&status=eq.approved`
	);
	if (!itemsResult.error && itemsResult.data) {
		contractItems = itemsResult.data as ContractItem[];
	}

	// 4. Calculate final amount
	const baseAmount = milestone.amount; // already in cents
	const adjustments = contractItems.reduce((sum, item) => sum + item.amount, 0);

	// Prorate adjustments across milestones by percentage
	const milestoneShare = milestone.percentage / 100;
	const proratedAdjustment = Math.round(adjustments * milestoneShare);
	const finalAmount = Math.max(0, baseAmount + proratedAdjustment);

	// 5. Create Stripe invoice
	const stripe = new Stripe(stripeSecretKey);

	try {
		// Find or create customer
		let customerId = contract.stripe_customer_id;

		if (!customerId && contract.client_email) {
			// Search for existing customer by email
			const customers = await stripe.customers.list({
				email: contract.client_email,
				limit: 1
			});

			if (customers.data.length > 0) {
				customerId = customers.data[0].id;
			} else {
				// Create new customer
				const customer = await stripe.customers.create({
					email: contract.client_email,
					name: contract.client_name || undefined,
					metadata: {
						contract_id: contract.id,
						project: projectKey
					}
				});
				customerId = customer.id;
			}

			// Store customer ID back on contract
			await supabaseUpdate(
				supabaseUrl, serviceRoleKey, 'contracts',
				`id=eq.${contractId}`,
				{ stripe_customer_id: customerId }
			);
		}

		if (!customerId) {
			return json({
				error: 'No customer email on contract. Add client_email to the contract before invoicing.'
			}, { status: 400 });
		}

		// Create invoice
		const invoice = await stripe.invoices.create({
			customer: customerId,
			collection_method: 'send_invoice',
			days_until_due: 7,
			metadata: {
				milestone_id: milestoneId,
				contract_id: contractId,
				project: projectKey
			}
		});

		// Add milestone line item
		await stripe.invoiceItems.create({
			customer: customerId,
			invoice: invoice.id,
			amount: baseAmount,
			currency: contract.currency || 'usd',
			description: `${contract.title} — ${milestone.name}`
		});

		// Add adjustment line items (upsells/discounts)
		for (const item of contractItems) {
			const itemShare = Math.round(item.amount * milestoneShare);
			if (itemShare === 0) continue;

			await stripe.invoiceItems.create({
				customer: customerId,
				invoice: invoice.id,
				amount: itemShare,
				currency: contract.currency || 'usd',
				description: `${item.type === 'discount' || item.type === 'incentive' ? 'Discount' : 'Add-on'}: ${item.title}`
			});
		}

		// Finalize the invoice (makes it ready to send)
		const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

		// 6. Update milestone with stripe_invoice_id
		await supabaseUpdate(
			supabaseUrl, serviceRoleKey, 'milestones',
			`id=eq.${milestoneId}`,
			{ stripe_invoice_id: finalizedInvoice.id }
		);

		// 7. Send email via Resend (if configured)
		let emailSent = false;
		if (resendApiKey && contract.client_email) {
			try {
				const resend = new Resend(resendApiKey);

				const loomEmbed = milestone.loom_url
					? `<div style="margin: 24px 0;">
						<p style="margin-bottom: 8px; color: #666;">Watch the delivery walkthrough:</p>
						<a href="${milestone.loom_url}" style="display: inline-block; padding: 12px 24px; background: #625df5; color: white; border-radius: 8px; text-decoration: none;">
							Watch Video
						</a>
					</div>`
					: '';

				const invoiceUrl = finalizedInvoice.hosted_invoice_url || '';

				await resend.emails.send({
					from: 'noreply@jomarchy.com',
					to: contract.client_email,
					subject: `Milestone Delivered: ${milestone.name} — ${contract.title}`,
					html: `
						<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
							<h2 style="color: #1a1a1a;">Milestone Delivered</h2>
							<p style="color: #444; font-size: 16px;">
								<strong>${milestone.name}</strong> for <em>${contract.title}</em> has been completed and delivered.
							</p>
							${milestone.description ? `<p style="color: #666; font-size: 14px; border-left: 3px solid #ddd; padding-left: 12px;">${milestone.description}</p>` : ''}
							${loomEmbed}
							<hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
							<h3 style="color: #1a1a1a;">Invoice</h3>
							<table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
								<tr>
									<td style="padding: 8px 0; color: #666;">Milestone</td>
									<td style="padding: 8px 0; text-align: right; font-weight: 600;">${formatCents(baseAmount, contract.currency)}</td>
								</tr>
								${contractItems.length > 0 ? contractItems.map(item => {
									const share = Math.round(item.amount * milestoneShare);
									if (share === 0) return '';
									return `<tr>
										<td style="padding: 4px 0; color: #666; font-size: 14px;">${item.amount < 0 ? 'Discount' : 'Add-on'}: ${item.title}</td>
										<td style="padding: 4px 0; text-align: right; font-size: 14px; color: ${item.amount < 0 ? '#16a34a' : '#666'};">${item.amount < 0 ? '-' : '+'}${formatCents(Math.abs(share), contract.currency)}</td>
									</tr>`;
								}).join('') : ''}
								<tr style="border-top: 2px solid #1a1a1a;">
									<td style="padding: 12px 0; font-weight: 700; font-size: 18px;">Total Due</td>
									<td style="padding: 12px 0; text-align: right; font-weight: 700; font-size: 18px;">${formatCents(finalAmount, contract.currency)}</td>
								</tr>
							</table>
							<p style="color: #666; font-size: 14px;">Payment is due within 7 days.</p>
							${invoiceUrl ? `<a href="${invoiceUrl}" style="display: inline-block; margin-top: 12px; padding: 14px 32px; background: #1a1a1a; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
								Pay Invoice
							</a>` : ''}
							<p style="color: #999; font-size: 12px; margin-top: 32px;">
								This invoice was generated automatically upon milestone delivery.
							</p>
						</div>
					`
				});

				emailSent = true;
			} catch (emailErr) {
				console.warn(`[invoice] Email send failed for milestone ${milestoneId}:`, emailErr);
				// Don't fail the invoice creation if email fails
			}
		}

		return json({
			success: true,
			invoice: {
				id: finalizedInvoice.id,
				number: finalizedInvoice.number,
				amount_due: finalizedInvoice.amount_due,
				hosted_invoice_url: finalizedInvoice.hosted_invoice_url,
				status: finalizedInvoice.status
			},
			emailSent,
			adjustments: {
				base: baseAmount,
				proratedAdjustment,
				final: finalAmount,
				items: contractItems.map(i => ({ title: i.title, type: i.type, amount: i.amount, share: Math.round(i.amount * milestoneShare) }))
			}
		}, { status: 201 });

	} catch (stripeErr) {
		console.error(`[invoice] Stripe error for milestone ${milestoneId}:`, stripeErr);
		return json({
			error: `Stripe error: ${(stripeErr as Error).message}`
		}, { status: 500 });
	}
};
