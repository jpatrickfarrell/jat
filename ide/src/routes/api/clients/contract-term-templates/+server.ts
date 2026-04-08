/**
 * GET /api/clients/contract-term-templates?project=<projectKey>
 *
 * Returns the default Marduk Method contract terms.
 * These are seeded into every new contract — client-specific terms
 * are added on top in the app after creation.
 *
 * Falls back to built-in defaults if the project has no custom terms configured.
 */

import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export interface BuiltinTerm {
	title: string
	body: string
	sort_order: number
}

const BUILTIN_CONTRACT_TERMS: BuiltinTerm[] = [
	{
		title: 'Technology Stack & Security',
		sort_order: 0,
		body: `The platform will be built using industry-leading infrastructure and frameworks with proven security track records including, but not limited to: Anthropic, Supabase (PostgreSQL), Cloudflare, GitHub, SvelteKit, and Tailwind CSS. These providers serve millions of users and are continuously audited by thousands of security researchers. Consultant follows modern development best practices but makes no independent guarantees regarding uptime, security, or performance — those are inherited from the underlying providers and dependent on Client's ongoing maintenance after handoff.`,
	},
	{
		title: 'Working Arrangements',
		sort_order: 1,
		body: `Business transformation consulting enabled with bespoke software engineering.

- **Engagement Cadence**: Work advances daily without requiring Client availability. No recurring meetings are required by default, though regular check-ins or daily sessions are available for clients who prefer a higher-touch cadence. Progress is always visible in the Client Portal.
- **Client Portal**: Client reviews milestones, accepts deliverables, raises feedback, and tracks the engagement directly at their application URL.
- **In-App Feedback**: Client submits bugs, change requests, and questions through the embedded feedback tool available on every page of the application. Each submission becomes a tracked, actionable task.
- **Task-Driven Milestones**: Milestone acceptance is automatic — when all linked tasks are completed, the milestone closes and an invoice is issued. Client sign-off is built into the platform workflow.
- **On-Demand or Scheduled Calls**: Video sessions are available on request or on a recurring schedule, depending on the Client's preferred working style. On-site visits may occur as mutually agreed; travel expenses (transportation, lodging, meals) are paid by Client.
- **Deliverable Focus**: Payment is based on deliverables and outcomes, not hours worked.`,
	},
	{
		title: 'Payments',
		sort_order: 2,
		body: `#### Invoicing & Due Dates

Invoices are issued upon milestone completion or as otherwise agreed. Payment is due within 7 days of invoice. All amounts are in USD.

#### Payment Methods

Consultant accepts wire transfer, credit card (+3% processing fee), or payment in Silver or Gold at spot value on the date of payment.

#### Non-Refundable Services

A central component of the work Consultant performs includes non-tangible intellectual property — business consulting, workflow analysis, system design, and training — that cannot be recouped once delivered, nor returned by Client. All payments are non-refundable once work under a milestone has begun.

#### Expenses

Client will reimburse Consultant for software, licenses, API credits, domains, tools, technology, hardware, or other resources reasonably required to complete engagement work. For incidental expenses under $500, Consultant may act immediately using professional judgment without prior client approval. Expenses of $500 or more require Client approval before being incurred. All billable expenses are submitted with receipts alongside the relevant invoice. Consultant may choose to absorb minor expenses at their own discretion and not bill them.

#### Payment Default & Suspension

If an invoice remains unpaid past its due date, interest accrues at 1.5% per month from the due date until paid in full. Consultant will provide written notice of default. If payment is not received within 5 business days of that notice, Consultant may suspend all new work until the account is brought current. Suspension of new work does not affect Client's access to or operation of any previously delivered application. If the account remains unpaid for an additional 10 days following suspension, Consultant may terminate this agreement and all outstanding amounts become immediately due.

A Client who defaults on payment twice within any 12-month period may be required to prepay future milestones before work begins.`,
	},
	{
		title: 'Intellectual Property',
		sort_order: 3,
		body: `#### Pre-existing Work

Each party retains ownership of any tools, frameworks, libraries, or methodologies they bring to the engagement. Consultant's proprietary platform framework ("the Framework") used to build and power the deliverables remains the exclusive property of Consultant and is licensed — not transferred — to Client under this agreement.

#### Deliverables

Consultant retains intellectual property rights to all custom code, systems, and architecture developed during the engagement. Upon completion, Consultant will provide Client with full access to the delivered source code in a form suitable for ongoing use and maintenance.

#### Client License

Client receives a perpetual, royalty-free license to use, modify, and maintain all deliverables for their own internal operations, including through internal staff or third-party developers of their choosing. This license cannot be revoked regardless of any future change in the relationship between the parties. Client may not resell, sublicense, or commercialize the deliverables as a standalone product or license them to direct competitors.

#### Framework License

The Framework powering the deliverables is licensed to Client solely for use within the delivered application. Client may not extract, repurpose, or redistribute the Framework independently of the delivered application. Third-party developers engaged by Client to maintain or extend the application may work within the Framework but are bound by the same restrictions.

#### No Lock-in

Client has full freedom to adapt, extend, and maintain delivered systems using any internal or external resources at any time. Source code will be made available in a standard, accessible format. No proprietary tooling or Consultant involvement is required to operate or modify the delivered application.

#### Future Value

If the delivered technology creates significant value beyond the original engagement scope, both parties agree to negotiate in good faith regarding appropriate value-sharing arrangements. Parties may at any time negotiate alternative engagement structures, including equity arrangements, that would supersede the fee-based terms of this agreement.`,
	},
	{
		title: 'Scope & Change Management',
		sort_order: 4,
		body: `#### Scope Definition

Scope is managed directly in the platform. Tasks linked to milestones constitute the agreed deliverables for that milestone. The task list is the authoritative record of what is included in the engagement — not a separate document.

#### Change Orders

New requests submitted through the in-app feedback tool are triaged by Consultant and either linked to an existing milestone, deferred to the icebox, or returned to Client with an effort estimate and cost adjustment for approval. Work on out-of-scope requests begins only upon written approval. Change orders that affect milestone amounts amend this agreement upon approval.

#### Bugs vs. Scope Changes

Defects — behavior that does not function as the linked task specifies — are addressed at no additional cost within the 30-day post-engagement support window. Requests for different behavior, new capabilities, or enhancements are scope changes subject to the change order process. Disagreements on classification are resolved in good faith before work is suspended.`,
	},
	{
		title: 'Client Obligations',
		sort_order: 5,
		body: `#### Timely Cooperation

Client agrees to provide timely access to information, systems, staff, credentials, and any other resources reasonably required to advance the engagement. When Consultant requests a decision, approval, or piece of information, Client will respond within 3 business days unless otherwise agreed.

#### Delays Caused by Client

If Client's failure to respond or provide required access delays the engagement, milestone dates and timelines will adjust by a corresponding period. Consultant is not liable for delays caused by Client unavailability, and such delays do not relieve Client of payment obligations on completed or in-progress milestones.

#### Extended Unresponsiveness

If Client is unresponsive to Consultant communications for 10 or more consecutive business days, Consultant may pause active work and notify Client in writing. Work will resume when Client re-engages. Paused periods do not extend payment due dates for milestones already delivered.`,
	},
	{
		title: 'Acceptance & Deemed Acceptance',
		sort_order: 6,
		body: `Upon delivery of a manually-delivered milestone, Client has 7 days to raise a written objection identifying what does not meet the agreed scope. If no objection is raised, the milestone is deemed accepted and the invoice becomes due. Deemed acceptance does not waive Client's right to report defects during the 30-day support window.

Task-driven milestones close automatically when all linked tasks are complete — no review period applies.`,
	},
	{
		title: 'Confidentiality & Non-Compete',
		sort_order: 7,
		body: `#### Mutual Confidentiality

Both parties agree to maintain strict confidentiality of the other party's proprietary information, business methods, and technical systems. Confidentiality obligations survive termination of this agreement for two years. Consultant may discuss general automation concepts, methodologies, and non-proprietary approaches for portfolio or marketing purposes.

#### Non-Solicitation

Client agrees not to directly solicit, recruit, or engage Consultant's subcontractors, associates, or team members for a period of 24 months following engagement completion.

#### Non-Compete

Consultant agrees not to develop substantially similar systems for Client's direct competitors for a period of 24 months following engagement completion.`,
	},
	{
		title: 'Data & Privacy',
		sort_order: 8,
		body: `#### Client Data

All data provided by Client — including business records and operational data — remains the exclusive property of Client. Consultant will access and use Client data solely for the purpose of building and delivering the agreed systems.

#### Handling Standards

Consultant will handle Client data with reasonable care, maintain appropriate access controls, and not share Client data with any third party except subcontractors bound by equivalent confidentiality obligations and engaged solely to advance the engagement.

#### Breach Notification

If Consultant becomes aware of any unauthorized access to or disclosure of Client data, Consultant will notify Client in writing within 48 hours of discovery and cooperate fully with any reasonable investigation or remediation.

#### Regulatory Compliance

Client is responsible for ensuring their use of the delivered platform complies with all applicable laws and regulations governing their industry. Consultant will build systems in a manner consistent with reasonable security practices, but Client bears ultimate responsibility for regulatory compliance in their operations.`,
	},
	{
		title: 'Relationship of Parties',
		sort_order: 9,
		body: `#### Independent Contractor Status

- **Independence:** Consultant operates as an independent contractor and retains full control over methods, tools, work schedule, and the means by which agreed deliverables are produced
- **No Employment Relationship:** Nothing in this agreement creates an employer-employee, partnership, joint venture, or agency relationship between the parties
- **No Employment Benefits:** Consultant is not entitled to health insurance, retirement plans, paid leave, workers' compensation, or any other employee benefits
- **Tax Responsibility:** Consultant is solely responsible for all federal, state, and local taxes on compensation received. Client will issue a 1099-NEC where required by law.
- **Other Engagements:** Consultant may provide services to other clients and engage in other professional activities, provided they do not create a material conflict of interest with Client's business
- **Equipment & Tools:** Consultant supplies and maintains their own tools, software, and infrastructure unless otherwise specified in this agreement
- **Indemnification:** Client indemnifies and holds Consultant harmless against any claims, costs, or liabilities arising from a third-party determination that Consultant is classified as an employee of Client
- **Subcontractors:** Consultant may engage subcontractors to assist with delivery. Consultant remains fully responsible for the quality and timeliness of all work regardless of who performs it. All subcontractors are bound by the same confidentiality obligations as Consultant. Core strategic and consulting work will not be subcontracted without Client's knowledge.

#### Liability & Indemnification

- **Limitation of Liability:** Consultant's total liability shall not exceed fees paid in the preceding 3 months
- **No Consequential Damages:** Neither party shall be liable for indirect, special, or consequential damages under any circumstances
- **Comprehensive Indemnification:** Client shall defend, indemnify, and hold Consultant harmless from any claims, damages, costs, and attorneys' fees arising from: (i) Client's use of the technology; (ii) Consultant's authorized access to Client systems; (iii) any employment classification claims; (iv) any third-party claims related to the project

#### Governing Law

This agreement shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of law provisions.

#### Dispute Resolution

- **Good Faith Negotiation:** The parties agree to a 30-day period of good faith negotiation before initiating formal proceedings
- **Arbitration:** Any unresolved dispute shall be settled by binding arbitration in Florida under the rules of the American Arbitration Association (AAA)
- **Prevailing Party:** The prevailing party in any dispute is entitled to recover reasonable attorneys' fees and costs
- **Injunctive Relief:** Either party may seek injunctive or other equitable relief in a court of competent jurisdiction for actual or threatened intellectual property violations without first exhausting arbitration

#### Termination Rights

- **For Cause:** Either party may terminate immediately upon written notice for material breach not cured within 10 days of notice
- **Without Cause:** Client may terminate the engagement at any time without cause. Upon termination: all active work ceases, Client's license to any undelivered work is revoked, and all outstanding fees become immediately due and payable.
- **Survival:** All intellectual property, confidentiality, liability, and indemnification provisions survive termination of this agreement

#### General Provisions

- **Entire Agreement:** This document constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, and understandings
- **Amendments:** Any modification to this agreement must be made in writing and signed by both parties
- **Severability:** If any provision is found invalid or unenforceable, the remaining provisions continue in full force and effect
- **Force Majeure:** Neither party shall be liable for delays or failures caused by circumstances beyond their reasonable control, including natural disasters, government actions, or infrastructure failures
- **Assignment:** Client may not assign or transfer any rights or obligations under this agreement without Consultant's prior written consent`,
	},
	{
		title: 'Continuity & Transition',
		sort_order: 10,
		body: `Consultant will provide 30 days of basic support and bug fixes following engagement completion at no additional cost. During this window, both parties are expected to discuss and agree on any ongoing arrangement. The following tiers are the default terms for post-engagement work — no separate agreement is required to activate them. Either party may propose new or amended terms at any time; accepted terms become part of this agreement and, where explicitly stated, supersede prior terms covering the same subject matter.

| Tier | Description | Rate |
|------|-------------|------|
| **Break/Fix Support** | System monitoring, bug fixes, and issue response. 24-hour response SLA. No new features. | $8,000/mo |
| **Feature Retainer** | Ongoing feature development at a measured pace — new capabilities, improvements, and maintenance worked in on a rolling basis. | $25,000/mo |
| **Development Retainer** | Full active engagement — new features, integrations, and platform growth at the same pace as the original build. | $50,000/mo |

Ongoing arrangements require explicit written opt-in from both parties. Retainers are billed monthly, do not accrue or roll over, and require 30 days written notice to cancel. If no arrangement is agreed upon before the 30-day support window closes, Consultant's obligations under this agreement end and no further work will be performed until new terms are established.

Should Consultant cease operations, become unavailable for more than 60 days, or the parties cannot agree on reasonable support terms, Client shall receive complete source code and documentation, full modification and maintenance rights, third-party development authorization, and reasonable transition assistance at Consultant's standard rate.`,
	},
	{
		title: 'Portfolio & Marketing Rights',
		sort_order: 11,
		body: `Consultant may reference this engagement in portfolio materials, case studies, and marketing — describing the nature of the work without disclosing Client's identity, proprietary methods, or confidential business information. Client may provide a testimonial or reference at their discretion but is not obligated to do so.`,
	},
]

export const GET: RequestHandler = async () => {
	return json({ terms: BUILTIN_CONTRACT_TERMS })
}
