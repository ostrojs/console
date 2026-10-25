/**
 * Class Table.
 */
class Table {
    public output: unknown;
    #headers: any[] = [];
    #rows: any[][] = [];
    #style: unknown;
    #columnStyle: unknown;

    /**
     * Create a new instance.
     * @param output - The output handler.
     */
    constructor(output: unknown) {
        this.output = output;
    }

    /**
     * Set table headers.
     * @param headers - Array or record of header names.
     * @returns The table instance.
     */
    public setHeaders(headers: any): this {
        this.#headers = headers;
        return this;
    }

    /**
     * Set table rows.
     * @param rows - Table rows data.
     * @returns The table instance.
     */
    public setRows(rows: any[][]): this {
        this.#rows = rows;
        return this;
    }

    /**
     * Set table style.
     * @param style - The table style.
     * @returns The table instance.
     */
    public setStyle(style: unknown): this {
        this.#style = style;
        return this;
    }

    /**
     * Set column style.
     * @param columnIndex - Column index or style.
     * @param style - The column style.
     * @returns The table instance.
     */
    public setColumnStyle(columnIndex: unknown, style?: unknown): this {
        this.#columnStyle = style !== undefined ? { [columnIndex as string]: style } : columnIndex;
        return this;
    }

    /**
     * Render the table.
     */
    public render(): void {
        const datas: Record<string, unknown>[] = [];
        for (const row of this.#rows) {
            const data: Record<string, unknown> = {};
            this.#headers.forEach((header: string, i: number) => {
                let message: unknown = row[i];
                if (typeof message === 'string') {
                    message = message.replace(/<.*>(.*)<\/.*>/g, '$1');
                }
                data[header] = message;
            });
            datas.push(data);
        }
        console.table(datas);
    }
}

export default Table;