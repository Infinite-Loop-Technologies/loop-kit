import path from 'node:path';
import fs from 'fs-extra';

export type FsGateway = {
    exists(filePath: string): Promise<boolean>;
    readText(filePath: string): Promise<string>;
    writeText(filePath: string, content: string): Promise<void>;
    remove(filePath: string): Promise<void>;
    mkdirp(dirPath: string): Promise<void>;
    stat(filePath: string): Promise<{ mtimeMs: number }>;
    readJson<T>(filePath: string): Promise<T>;
    writeJson(filePath: string, value: unknown): Promise<void>;
    readdir(dirPath: string): Promise<string[]>;
    copyFile(source: string, target: string): Promise<void>;
};

export const nodeFsGateway: FsGateway = {
    async exists(filePath) {
        return fs.pathExists(filePath);
    },
    async readText(filePath) {
        return fs.readFile(filePath, 'utf8');
    },
    async writeText(filePath, content) {
        await fs.mkdirp(path.dirname(filePath));
        await fs.writeFile(filePath, content, 'utf8');
    },
    async remove(filePath) {
        await fs.remove(filePath);
    },
    async mkdirp(dirPath) {
        await fs.mkdirp(dirPath);
    },
    async stat(filePath) {
        const value = await fs.stat(filePath);
        return { mtimeMs: value.mtimeMs };
    },
    async readJson(filePath) {
        return fs.readJson(filePath) as Promise<any>;
    },
    async writeJson(filePath, value) {
        await fs.mkdirp(path.dirname(filePath));
        await fs.writeJson(filePath, value, { spaces: 2 });
    },
    async readdir(dirPath) {
        return fs.readdir(dirPath);
    },
    async copyFile(source, target) {
        await fs.mkdirp(path.dirname(target));
        await fs.copyFile(source, target);
    },
};
