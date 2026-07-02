import Store from "electron-store";

type WorkspaceStore = {
    workspaceFolder?: string;
};

const store = new Store<WorkspaceStore>({
    defaults: { workspaceFolder: undefined },
});

export function getWorkspaceFolder(): string | undefined {
    return store.get("workspaceFolder");
}

export function setWorkspaceFolder(folder: string): void {
    store.set("workspaceFolder", folder);
}
