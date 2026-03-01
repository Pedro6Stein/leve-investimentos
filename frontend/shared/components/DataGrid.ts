export interface ColumnConfig<T> {
    header: string;
    key: keyof T | string;
    render?: (item: T) => string;
}

export class DataGrid<T> {
    constructor(
        private containerId: string,
        private columns: ColumnConfig<T>[]
    ) {}

    public render(data: T[]): void {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        if (data.length === 0) {
            container.innerHTML = `
                <div class="uk-alert-warning" uk-alert>
                    <p>Nenhum registo encontrado.</p>
                </div>`;
            return;
        }

        container.innerHTML = `
            <table class="uk-table uk-table-hover uk-table-divider">
                <thead>
                    <tr>
                        ${this.columns.map(col => `<th>${col.header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => this.createRow(item)).join('')}
                </tbody>
            </table>`;
    }

    private createRow(item: T): string {
        const cells = this.columns.map(col => {
            if (col.render) {
                return `<td>${col.render(item)}</td>`;
            }
            
            const value = this.getNestedValue(item, col.key as string);
            return `<td>${value ?? '—'}</td>`;
        });

        return `<tr>${cells.join('')}</tr>`;
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }
}