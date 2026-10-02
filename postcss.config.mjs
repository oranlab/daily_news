import postcssImport from 'postcss-import';
import nesting from 'tailwindcss/nesting/index.js';
import tailwindcss from 'tailwindcss';

export default { plugins: [postcssImport(), nesting(), tailwindcss()] };
