import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import sveltePreprocess from 'svelte-preprocess'
import typescript from '@rollup/plugin-typescript'
import pkg from './package.json'

const production = !process.env.ROLLUP_WATCH;
// TODO decoration metadata
export default {
	input: 'src/index.js',
	output: [{
		file: pkg.main,
		format: 'cjs',
		sourcemap: true
	}, {
		file: pkg.module,
		format: 'es',
		sourcemap: true
	}],
	plugins: [
		svelte({
			dev: !production,
			preprocess: sveltePreprocess({})
		}),
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		production && terser(),
		typescript()
	],
	watch: {
		clearScreen: true
	}
};