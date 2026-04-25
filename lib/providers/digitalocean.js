/**
 * DigitalOcean provider.
 *
 * Implements the CloudProvider interface against the DO v2 REST API.
 * Docs: https://docs.digitalocean.com/reference/api/api-reference/#tag/Droplets
 *
 * Auth: Personal Access Token (Bearer). Resolve via:
 *   jat-secret digitalocean_api_token
 * or pass an explicit `token` to the constructor.
 */

const API_BASE = 'https://api.digitalocean.com/v2';

// DO native droplet status → normalized status.
// https://docs.digitalocean.com/reference/api/api-reference/#operation/droplets_get
const STATUS_MAP = {
	new: 'provisioning',
	active: 'running',
	off: 'stopped',
	archive: 'stopped'
};

export class DigitalOceanProvider {
	/**
	 * @param {{ token?: string, defaultRegion?: string, defaultSize?: string, defaultImage?: string }} [opts]
	 */
	constructor(opts = {}) {
		this.name = 'digitalocean';
		this.token = opts.token || '';
		this.defaultRegion = opts.defaultRegion || 'nyc3';
		this.defaultSize = opts.defaultSize || 's-2vcpu-4gb';
		this.defaultImage = opts.defaultImage || 'ubuntu-24-04-x64';
	}

	/**
	 * @param {string} path
	 * @param {RequestInit} [init]
	 */
	async _request(path, init = {}) {
		if (!this.token) {
			throw new Error('DigitalOcean API token not configured (set jat-secret digitalocean_api_token)');
		}
		const headers = {
			Authorization: `Bearer ${this.token}`,
			'Content-Type': 'application/json',
			...(init.headers || {})
		};
		const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
		if (res.status === 204) return null;
		const text = await res.text();
		const body = text ? JSON.parse(text) : null;
		if (!res.ok) {
			const msg = body?.message || body?.id || res.statusText;
			throw new Error(`DigitalOcean API ${res.status}: ${msg}`);
		}
		return body;
	}

	/** @param {import('./types.d.ts').CreateVpsOpts} opts */
	async createVps(opts) {
		if (!opts?.label) throw new Error('createVps: label is required');
		const body = {
			name: opts.label,
			region: opts.region || this.defaultRegion,
			size: opts.size || this.defaultSize,
			image: opts.image || this.defaultImage,
			tags: opts.tags || [],
			ssh_keys: opts.sshKeyIds || [],
			user_data: opts.userData || undefined
		};
		const data = await this._request('/droplets', {
			method: 'POST',
			body: JSON.stringify(body)
		});
		return this._normalize(data?.droplet);
	}

	/** @param {string} id */
	async destroyVps(id) {
		await this._request(`/droplets/${encodeURIComponent(id)}`, { method: 'DELETE' });
	}

	/** @param {string} id */
	async getVps(id) {
		try {
			const data = await this._request(`/droplets/${encodeURIComponent(id)}`);
			return data?.droplet ? this._normalize(data.droplet) : null;
		} catch (err) {
			if (err instanceof Error && err.message.startsWith('DigitalOcean API 404')) return null;
			throw err;
		}
	}

	/** @param {import('./types.d.ts').ListVpsFilter} [filter] */
	async listVps(filter = {}) {
		const path = filter.tag
			? `/droplets?tag_name=${encodeURIComponent(filter.tag)}&per_page=200`
			: '/droplets?per_page=200';
		const data = await this._request(path);
		return (data?.droplets || []).map((row) => this._normalize(row));
	}

	/** @returns {import('./types.d.ts').VpsInstance} */
	_normalize(row) {
		// Public IPv4: pick the first network entry of type "public".
		const v4 = row?.networks?.v4 || [];
		const publicIp = v4.find((n) => n.type === 'public')?.ip_address || null;
		return {
			id: String(row.id),
			provider: 'digitalocean',
			label: row.name,
			status: STATUS_MAP[row.status] || 'unknown',
			ip: publicIp,
			region: row.region?.slug || row.region || '',
			size: row.size_slug || '',
			tags: row.tags || [],
			createdAt: row.created_at,
			raw: row
		};
	}
}
