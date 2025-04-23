# Frontend of Viewer

.nvmrc - stores Node version to use.

eslinc.config.js - code linting.

package.json - add info about dependencies here (you also do `npm install <dependendy>`). Command line scripts are also defined here; you can define custom ones too. 

package-lock.json - info about RESOLVED versions of installed packages (created automatically).

postcss.config.js - needed for Tailwind CSS to work.

tailwind.config.js - needed for Tailwind CSS to work. Here you define which files should be inspected by Tailwind in search of Tailwind CSS classes.

tsconfig.json - TypeScript settings

vite-env.d.ts - I think Vite needs that for Typescript to work

node_modules - installed dependencies. Usually are not passed to Docker containers - instead Docker containers build/download these dependencies themselves.

public - things that are be served to clients in their webbrowsers

public/vite.config.ts - 



# Other

- Vite is only used in developmnet mode. For production use, Vite builds the final .js/.html/.css files and then these files can be directly understood by the browser.