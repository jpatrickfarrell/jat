/**
 * Linode (Akamai Cloud) provider.
 *
 * Implements the CloudProvider interface against the Linode v4 REST API.
 * Docs: https://www.linode.com/docs/api/linode-instances/
 *
 * Auth: Personal Access Token (Bearer). Resolve via:
 *   jat-secret linode_api_token
 * or pass an explicit `token` to the constructor.
 */

const API_BASE = 'https://api.linode.com/v4';

// Linode native lifecycle → normalized status.
// https://www.linode.com/docs/api/linode-instances/#linode-view__response-samples
const STATUS_MAP = {
	provisioning: 'provisioning',
	booting: 'provisioning',
	rebooting: 'provisioning',
	migrating: 'provisioning',
	cloning: 'provisioning',
	restoring: 'provisioning',
	rebuilding: 'provisioning',
	resizing: 'provisioning',
	running: 'running',
	offline: 'stopped',
	stopped: 'stopped',
	shutting_down: 'destroying',
	deleting: 'destroying'
};

export class LinodeProvider {
	/**
	 * @param {{ token?: string, defaultRegion?: string, defaultSize?: string, defaultImage?: string }} [opts]
	 */
	constructor(opts = {}) {
		this.name = 'linode';
		this.token = opts.token || '';
		this.defaultRegion = opts.defaultRegion || 'us-east';
		this.defaultSize = opts.defaultSize || 'g6-standard-2'; // 4GB RAM, 2 vCPU
		this.defaultImage = opts.defaultImage || 'linode/ubuntu24.04';
	}

	/**
	 * @param {string} path
	 * @param {RequestInit & { filter?: object }} [init]
	 */
	async _request(path, init = {}) {
		if (!this.token) {
			throw new Error('Linode API token not configured (set jat-secret linode_api_token)');
		}
		const headers = {
			Authorization: `Bearer ${this.token}`,
			'Content-Type': 'application/json',
			...(init.headers || {})
		};
		// Linode uses an X-Filter header for list filtering instead of query params.
		if (init.filter) {
			headers['X-Filter'] = JSON.stringify(init.filter);
		}
		const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
		if (res.status === 204) return null;
		const text = await res.text();
		const body = text ? JSON.parse(text) : null;
		if (!res.ok) {
			const msg = body?.errors?.map((e) => e.reason).join('; ') || res.statusText;
			throw new Error(`Linode API ${res.status}: ${msg}`);
		}
		return body;
	}

	/** @param {import('./types.d.ts').CreateVpsOpts} opts */
	async createVps(opts) {
		if (!opts?.label) throw new Error('createVps: label is required');
		const body = {
			label: opts.label,
			region: opts.region || this.defaultRegion,
			type: opts.size || this.defaultSize,
			image: opts.image || this.defaultImage,
			tags: opts.tags || [],
			authorized_keys: undefined,
			authorized_users: undefined,
			root_pass: opts.rootPass,
			metadata: opts.userData ? { user_data: Buffer.from(opts.userData).toString('base64') } : undefined
		};
		// Linode SSH key IDs are actually usernames of existing accounts; if the
		// caller has raw public-key strings instead, they should be passed via
		// userData (cloud-init). Here we treat sshKeyIds as authorized usernames.
		if (opts.sshKeyIds?.length) body.authorized_users = opts.sshKeyIds;
		// root_pass is required when no SSH access is configured.
		if (!body.authorized_users?.length && !body.root_pass) {
			throw new Error('Linode createVps: rootPass or sshKeyIds (authorized_users) required');
		}
		const data = await this._request('/linode/instances', {
			method: 'POST',
			body: JSON.stringify(body)
		});
		return this._normalize(data);
	}

	/** @param {string} id */
	async destroyVps(id) {
		await this._request(`/linode/instances/${encodeURIComponent(id)}`, { method: 'DELETE' });
	}

	/** @param {string} id */
	async getVps(id) {
		try {
			const data = await this._request(`/linode/instances/${encodeURIComponent(id)}`);
			return data ? this._normalize(data) : null;
		} catch (err) {
			if (err instanceof Error && err.message.startsWith('Linode API 404')) return null;
			throw err;
		}
	}

	/** @param {import('./types.d.ts').ListVpsFilter} [filter] */
	async listVps(filter = {}) {
		const init = filter.tag ? { filter: { tags: filter.tag } } : {};
		const data = await this._request('/linode/instances', init);
		return (data?.data || []).map((row) => this._normalize(row));
	}

	/** @returns {import('./types.d.ts').VpsInstance} */
	_normalize(row) {
		return {
			id: String(row.id),
			provider: 'linode',
			label: row.label,
			status: STATUS_MAP[row.status] || 'unknown',
			ip: row.ipv4?.[0] || null,
			region: row.region,
			size: row.type,
			tags: row.tags || [],
			createdAt: row.created,
			raw: row
		};
	}
}
