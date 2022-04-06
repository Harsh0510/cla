/* eslint-disable */
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
	input: 'worker.js',
	output: {
		file: 'bundle.js',
		format: 'cjs'
	},
	external: [
		'@azure/storage-blob',
		'mime-types',
		'pg',
		'fs',
		'child_process',
		'path',
		'cluster',
		'crypto',
		'util',
		'axios',
		'shell-quote',
	],
	plugins: [
		json(),
		resolve(),
		commonjs()
	]
};
/* eslint-enable */
