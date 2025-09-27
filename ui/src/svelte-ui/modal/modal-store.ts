import { bind } from 'svelte-simple-modal';
import { get, writable } from 'svelte/store';
import type { Component } from '../../logic/util';

const CurrentModal = writable<Component | null>(null);

export abstract class ModalManager {
	static open(modal: Component, props: Record<string, any> = {}) {
		if (get(CurrentModal) === modal) CurrentModal.set(null);
		else CurrentModal.set(bind(modal as any, props) as unknown as Component);
	}

	static close() {
		CurrentModal.set(null);
	}

	static get store() {
		return CurrentModal;
	}
}
