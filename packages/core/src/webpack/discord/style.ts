import { discordDomReadyPromise } from '@/webpack/discord/promises.ts';

export class StyleManager {
	private static styleElements = new Map<string, HTMLStyleElement>();
	private static parentContainer: HTMLElement | undefined = undefined;

	private static pendingQueue: { id: string; css:string }[] = [];
	private static isListening: boolean = false;

	private static PARENT_ID = "foxcord-mod-styles";

	public static addStyle(id: string, css: string) {
		if (this.styleElements.has(id)) return;

		if (!document || !document.head) {
			this.pendingQueue.push({ id, css });
			this.setupListener();
			return;
		}

		const el = document.createElement("style");
		el.id = `foxcord-style-${id}`;
		el.textContent = css;

		this.retrieveGlobalElement().appendChild(el);
		this.styleElements.set(id, el);
	}

	public static removeStyle(id: string) {
		const el = this.styleElements.get(id);
		if (el) {
			el.remove();
			this.styleElements.delete(id);
		}
	}

	private static setupListener() {
		if (this.isListening) return;
		this.isListening = true;

		const flush = () =>{
			if (!document || !document.head) return;

			const queue = [...this.pendingQueue];
			this.pendingQueue = [];
			this.isListening = false;

			for (const { id, css} of queue) {
				this.addStyle(id, css);
			}
		}

		discordDomReadyPromise.promise.then(flush);
	}

	private static retrieveGlobalElement(): HTMLElement {
		if (this.parentContainer) return this.parentContainer;

		let el = document.getElementById(this.PARENT_ID);

		if (!el) {
			el = document.createElement("div");
			el.id = this.PARENT_ID;

			document.head.appendChild(el);
		}

		this.parentContainer = el;
		return el;
	}
}
