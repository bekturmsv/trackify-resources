import typescript  from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs     from '@rollup/plugin-commonjs';
import dts          from 'rollup-plugin-dts';

export default [
    // JavaScript bundles
    {
        input: 'src/index.ts',
        plugins: [nodeResolve(), commonjs(), typescript()],
        output: [
            {
                dir:            'dist',
                entryFileNames: 'index.cjs.js',
                format:         'cjs',
                sourcemap:      true,
            },
            {
                dir:            'dist',
                entryFileNames: 'index.esm.js',
                format:         'esm',
                sourcemap:      true,
            },
            {
                dir:                    'dist',
                entryFileNames:         'index.umd.js',
                format:                 'umd',
                name:                   'ResourceMonitor',
                sourcemap:              true,
                inlineDynamicImports:  true,
            },
        ],
    },
    // TypeScript declaration bundle
    {
        input:  'src/index.ts',
        plugins:[dts()],
        output: {
            file:   'dist/index.d.ts',
            format: 'es',
        }
    }
];
