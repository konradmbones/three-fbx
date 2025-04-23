import {lg} from "./__localGlobals.ts"
import { requestBVH } from "./__requestBVH.ts"

/**
* 
* @param {string[]} columns 
* @param {Array.<Object>} rows 
*/
export function refreshBrowserTable(columns: any[], rows: any[]) {
    const browserTable = document.getElementById("browser-table")!

    //// clear table
    // while (browserTable.firstChild) {
    //     browserTable.removeChild(browserTable.firstChild);
    // }

    const pretransformCell = (cell: string) => {
        cell = cell.replace(`${lg.QUERY_BASEPATH}`, "")
        return cell
    }

    
    browserTable.innerHTML = 
    /*html*/`
    <tbody>

        <tr class="">
            ${
                columns.map((col) => /*html*/`
                    <th class="px-1 sticky top-0  bg-gray-200 ">${col}</th>
                `).join("")
            }
        </tr>
        ${
            rows.map((row) => /*html*/`
                <tr name="datarow" class=" cursor-pointer hover:bg-gray-100  align-top">
                    ${
                    Object.keys(row).map((key) => /*html*/`
                        <td class="px-1 border break-all ${key.startsWith('MOVE')? 'min-w-72' : ''}">${
                            key=="local_bvh_path"? pretransformCell(row[key]): row[key]
                        }</td>
                    `).join("")
                    }
                </tr>
            `).join("")
        }
    </tbody>
    `

    browserTable.querySelectorAll("tr[name='datarow']").forEach((row: Element, i) => {
        const c = lg.SOURCE === "localpaths" ? "local_bvh_path" : "MOVE_org_name";
        let cell = rows[i][c];
        (row as HTMLElement).onclick = () => {requestBVH({ val: cell })}
    })


    // //// add column row
    // const colRow = document.createElement("tr")
    // // colRow.className = ""
    // columns.forEach((col) => {
    //     const th = document.createElement("th")
    //     th.innerHTML = col
    //     // pad first column
    //     th.className = "text-left ps-2 sticky top-0 bg-gray-100"
    //     colRow.appendChild(th)
    // })
    // browserTable.appendChild(colRow)

    // //// add data rows
    // rows.forEach((row) => {
    //     const dataRow = document.createElement("tr")
    //     dataRow.className = "border border-t-2 cursor-pointer hover:bg-gray-200  break-all"
    //     dataRow.onclick = () => loadAnimFromSelectedRow(row["MOVE_org_name"])
    //     Object.keys(row).forEach((key) => {
    //         const td = document.createElement("td")
    //         // pad first column
    //         td.className = "ps-2"
    //         td.innerHTML = row[key]
    //         dataRow.appendChild(td)
    //     })
    //     browserTable.appendChild(dataRow)
    // });
}
