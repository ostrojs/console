import Command from './command';
import { rtrim, trim, ltrim } from '@ostro/support/function';
import * as StringHelper from '@ostro/support/string';
import path, { dirname } from 'node:path';

declare const isDirectory: any;
declare const app_path: any;
declare const resource_path: any;

/**
 * Class GeneratorCommand.
 */
class GeneratorCommand extends Command {

    public $file: any;

    public $type: any;

    public get $dirname(): string {
        return __dirname;
    }

    public getStub(): any {}
    public declare argument: any;

    $reservedNames = [
        'abstract',
        'and',
        'as',
        'break',
        'case',
        'catch',
        'class',
        'const',
        'continue',
        'default',
        'do',
        'else',
        'elseif',
        'eval',
        'exit',
        'extends',
        'finally',
        'for',
        'function',
        'global',
        'if',
        'instanceof',
        'new',
        'or',
        'public',
        'require',
        'return',
        'static',
        'switch',
        'throw',
        'try',
        'var',
        'while',
        'yield',
    ];

    public get $arguments(): any {
        return [
            this.createArgument('name', 'The name of the migration').required()
        ];
    }

    /**
     * Create a new instance.
     * @param {*} $files
     */
    constructor($files: any) {
        super()

        this.$file = $files;
    }

    /**
     * handle method.
     * @async
     * @returns {any}
     */
    public async handle() {
        let $name = this.getNameInput()

        if (this.isReservedName($name)) {
            this.error('The name "' + $name + '" is reserved by js.');

            return false;
        }

        let qualifyClass = await this.qualifyClass($name)

        let $path = await this.getPath(qualifyClass)

        if ((!this.hasOption('force') || !this.option('force')) && await this.alreadyExists($path)) {
            this.error(this.$type + ' already exists!');

            return false;
        }

        await this.makeDirectory($path);
        let $stub = await this.buildClass($name)
        if ($stub) {
            await this.$file.put($path, $stub.toString());
            this.info(this.$type + ' created successfully.');
        } else {
            this.error('Unable to create ' + this.$type);

        }

    }

    /**
     * qualifyClass method.
     * @param {*} $name
     * @returns {any}
     */
    public qualifyClass($name: string) {
        $name = $name.trim()
        let $rootNamespace = this.rootNamespace();

        if ($name.startsWith($rootNamespace)) {
            return $name;
        }
        return this.qualifyClass(
            path.join(this.getDefaultNamespace(rtrim($rootNamespace, path.sep)), $name)
        );
    }

    /**
     * getDefaultNamespace method.
     * @param {*} $rootNamespace
     * @returns {any}
     */
    public getDefaultNamespace($rootNamespace: any) {
        return $rootNamespace;
    }

    /**
     * qualifyModel method.
     * @param {*} $model
     * @returns {any}
     */
    public qualifyModel($model: any) {
        $model = ltrim($model, '/');

        let $rootNamespace = this.rootNamespace();

        if (typeof $model === 'string' && $model.startsWith($rootNamespace)) {
            return $model;
        }

        return isDirectory(app_path('models')) ?
            app_path('models/' + $model) :
            path.join($rootNamespace, $model);
    }

    /**
     * alreadyExists method.
     * @param {*} $rawName
     * @returns {any}
     */
    public alreadyExists($rawName: any) {
        return this.$file.exists($rawName)
    }

    /**
     * getFileName method.
     * @param {*} $name
     * @returns {any}
     */
    public getFileName($name: string) {
        $name = path.normalize($name)
        let lastSlash = $name.lastIndexOf(path.sep)
        lastSlash = lastSlash > -1 ? lastSlash : 0
        return trim($name.slice(lastSlash, $name.length), path.sep)
    }

    /**
     * Determine if the application is using TypeScript.
     *
     * @returns {boolean}
     */
    public isTypeScript(): boolean {
        if (!this.$app) {
            return false;
        }
        try {
            if (this.$app['config']) {
                const configVal = typeof this.$app['config'].get === 'function' ?
                    this.$app['config'].get('app.typescript') :
                    this.$app['config']['app.typescript'];
                if (typeof configVal === 'boolean') {
                    return configVal;
                }
            }
        } catch (_) {}

        if (typeof super.isTypeScript === 'function') {
            return super.isTypeScript();
        }

        if (typeof this.$app.basePath !== 'function') {
            return false;
        }
        try {
            const fs = require('node:fs');
            return fs.existsSync(this.$app.basePath('tsconfig.json')) ||
                fs.existsSync(this.$app.basePath('tsconfig.build.json')) ||
                fs.existsSync(this.$app.basePath('app.ts'));
        } catch {
            return false;
        }
    }

    /**
     * getPath method.
     * @param {*} $name
     * @returns {any}
     */
    public getPath($name: string) {
        let $class = StringHelper.camel(this.getFileName($name))
        let namespace = this.getNamespace($name).replace(this.rootNamespace(), '')
        let ext = this.isTypeScript() ? '.ts' : '.js'
        return this.rootNamespace(path.join(namespace, $class + ext))
    }

    /**
     * makeDirectory method.
     * @async
     * @param {*} $path
     * @returns {any}
     */
    public async makeDirectory($path: string) {
        await this.$file.makeDirectory(dirname($path), 0o755, true, true);

        return $path;
    }

    /**
     * resolveStubPath method.
     * @param {*} $stub
     * @returns {any}
     */
    public resolveStubPath($stub: any) {
        if (this.isTypeScript()) {
            let tsStub = $stub.replace(/\.stub$/, '.ts.stub');
            let customTsPath = this.$app.basePath(trim(tsStub, '/'));
            let fallbackTsPath = path.join(this.$dirname, tsStub);
            return this.$file.exists(customTsPath).then(($exists: any) => {
                if ($exists) return customTsPath;
                return this.$file.exists(fallbackTsPath).then(($fallbackExists: any) => {
                    if ($fallbackExists) return fallbackTsPath;
                    let $customPath = this.$app.basePath(trim($stub, '/'));
                    return this.$file.exists($customPath).then(($e: any) => ($e ? $customPath : path.join(this.$dirname, $stub)));
                });
            });
        }
        let $customPath = this.$app.basePath(trim($stub, '/'))
        return this.$file.exists($customPath).then(($exists: any) => ($exists ? $customPath : path.join(this.$dirname, $stub)))
    }

    /**
     * buildClass method.
     * @async
     * @param {*} $name
     * @returns {any}
     */
    public async buildClass($name: string) {
        let $stub = await this.getStub()
        return this.$file.get($stub)
            .then($stub => {
                $stub = this.replaceNamespace($stub, $name)
                $stub = this.replaceClass($stub, $name)
                return $stub
            })

    }

    /**
     * replaceNamespace method.
     * @param {*} $stub
     * @param {*} $name
     * @returns {any}
     */
    public replaceNamespace($stub: any, $name: string) {
        let $searches = {
            'DummyNamespace': this.getNamespace($name),
            'DummyRootNamespace': this.getNamespace($name),
            'NamespacedDummyUserModel': this.getNamespace($name),
            '{{ namespace }}': this.rootNamespace(),
            '{{ rootNamespace }}': this.rootNamespace(),
            '{{ namespacedUserModel }}': this.rootNamespace(),
            '{{namespace}}': this.userProviderModel(),
            '{{rootNamespace}}': this.userProviderModel(),
            '{{namespacedUserModel}}': this.userProviderModel(),
        };
        $stub = StringHelper.replaceAllArray($stub,
            Object.keys($searches), Object.values($searches)

        );

        return $stub;
    }

    /**
     * getNamespace method.
     * @param {*} $name
     * @returns {any}
     */
    public getNamespace($name: string) {
        $name = path.normalize($name)
        return rtrim($name.slice(0, $name.lastIndexOf(path.sep)), path.sep);
    }

    /**
     * replaceClass method.
     * @param {*} $stub
     * @param {*} $name
     * @returns {any}
     */
    public replaceClass($stub: any, $name: string) {
        let $class = StringHelper.ucfirst(StringHelper.pascal(this.getFileName($name)));
        return StringHelper.replaceAll($stub, ['DummyClass', '{{ class }}', '{{class}}'], $class);
    }

    /**
     * sortImports method.
     * @param {*} $stub
     * @returns {any}
     */
    public sortImports($stub: any) {
        return $stub;
    }

    /**
     * getNameInput method.
     * @returns {any}
     */
    public getNameInput() {
        return trim(this.argument('name'));
    }

    /**
     * rootNamespace method.
     * @param {*} $path
     * @returns {any}
     */
    public rootNamespace($path: string = '') {
        return this.$app.basePath($path);
    }

    /**
     * userProviderModel method.
     * @returns {any}
     */
    public userProviderModel() {
        let $config = this.$app['config'];

        let $provider = $config.get('auth.guards.' + $config.get('auth.defaults.guard') + '.provider');

        return $config.get(`auth.providers.${$provider}.model`);
    }

    /**
     * isReservedName method.
     * @param {*} $name
     * @returns {any}
     */
    public isReservedName($name: string) {
        $name = $name.toLowerCase();

        return this.$reservedNames.indexOf($name) > -1;
    }

    /**
     * viewPath method.
     * @param {*} $path
     * @returns {any}
     */
    public viewPath($path: string = '') {
        const $views = this.$app['config']['view.paths'][0] || (typeof resource_path === 'function' ? resource_path('views') : '');

        return $views + ($path ? path.sep + $path : $path);
    }

}

export default GeneratorCommand;