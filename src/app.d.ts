import type { KVNamespace, Ai } from '@cloudflare/workers-types';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: {
				AI: Ai;
				ORACLE_KV: KVNamespace;
			};
			cf?: IncomingRequestCfProperties;
			ctx?: ExecutionContext;
		}
	}
}

export {};
