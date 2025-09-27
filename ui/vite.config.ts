import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, mergeConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';

const viteConfig = defineConfig({
	plugins: [sveltekit()]
});

const vitestConfig = defineVitestConfig({
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});

export default mergeConfig(viteConfig, vitestConfig);
