const kHeaders = Symbol('headers')
const kRows = Symbol('row')
const kStyle = Symbol('style')
const kColumStyle = Symbol('columnStyle')

class Table {

    constructor(output) {
        this.output = output
    }

    setHeaders(headers) {
    	this[kHeaders] = headers
        return this
    }

    setRows(rows) {
    	this[kRows] = rows
        return this
    }

    setStyle(style) {
    	this[kStyle] = style
        return this
    }

    setColumnStyle(style) {
    	this[kColumStyle] = style
    }

    render() {
    	let datas = []
    	for(let row of this[kRows]){
    		let data = {}
    		this[kHeaders].forEach((header,i)=>{
    			let message = row[i]
    			if(typeof message == 'string'){
    				message = message.replace(/<.*>(.*)<\/.*>/g,'$1')
    			}
    			data[header] = message
    		})
    		datas.push(data)
    	}
    	console.table(datas)
    }

}

module.exports = Table