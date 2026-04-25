/**
 * Cloud provider abstraction types.
 *
 * A CloudProvider hides the differences between cloud APIs (Linode/Akamai,
 * DigitalOcean, …) behind a small VPS-lifecycle interface. Used by the JAT
 * spawn layer to provision ephemeral worker VPSes on demand.
 */

export type ProviderName = 'linode' | 'digitalocean';

/**
 * Normalized lifecycle state. Each provider maps its native states into one
 * of these so callers don't have to special-case Linode vs DO vocabulary.
 */
export type VpsStatus =
	| 'provisioning' // VPS is being built / booted (not ready for SSH)
	| 'running' // VPS is up and reachable
	| 'stopped' // VPS exists but is powered off
	| 'destroying' // Delete request accepted, teardown in progress
	| 'unknown'; // Native state didn't match any of the above

export interface VpsInstance {
	id: string; // provider-assigned id, stringified
	provider: ProviderName;
	label: string; // human-readable name (set on create)
	status: VpsStatus;
	ip: string | null; // public IPv4, null until assigned
	region: string; // provider region slug (e.g. "us-east", "nyc3")
	size: string; // provider plan/type slug (e.g. "g6-standard-2", "s-2vcpu-4gb")
	tags: string[];
	createdAt: string; // ISO8601 timestamp from provider
	raw?: unknown; // provider response body, for debugging
}

export interface CreateVpsOpts {
	label: string; // required — used as the VPS hostname/label
	region?: string; // defaults to provider's default region
	size?: string; // defaults to provider's default plan
	image?: string; // defaults to provider's default Ubuntu image
	sshKeyIds?: string[]; // provider-specific SSH key identifiers
	tags?: string[]; // tags applied to the VPS for filtering / cost tracking
	userData?: string; // cloud-init user-data script
	rootPass?: string; // Linode requires a root password if no SSH keys
}

export interface ListVpsFilter {
	tag?: string; // restrict to VPSes carrying this tag
}

/**
 * Concrete provider implementations satisfy this interface.
 * All methods throw on transport / authentication errors. getVps returns
 * `null` (not an error) when the instance no longer exists.
 */
export interface CloudProvider {
	readonly name: ProviderName;

	/** Provider's default region (used when CreateVpsOpts.region is omitted). */
	readonly defaultRegion: string;
	/** Provider's default plan/size. */
	readonly defaultSize: string;
	/** Provider's default OS image. */
	readonly defaultImage: string;

	createVps(opts: CreateVpsOpts): Promise<VpsInstance>;
	destroyVps(id: string): Promise<void>;
	getVps(id: string): Promise<VpsInstance | null>;
	listVps(filter?: ListVpsFilter): Promise<VpsInstance[]>;
}
