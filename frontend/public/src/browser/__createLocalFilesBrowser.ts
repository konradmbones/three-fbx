import { lg } from "./__localGlobals";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling
import { updateCurrentPage } from './__updateCurrentPage';
import { getTablePage } from './__getMetadataPage';
import { requestBVH } from "./__requestBVH";


export function createLocalFilesBrowser(){
    console.log("createLocalFilesBrowser")
    
    lg.BROWSER_TYPE = "localFiles"

    const browser = document.getElementById("browser")!;
    browser.className = "flex flex-col h-full w-full "
    browser.innerHTML = /*html*/`
    <div class="flex flex-wrap m-2 gap-2 flex-initial  items-center">
        <span>find</span>
        <input spellcheck="false"  id="tab-search-input" type="text" name="search" placeholder="jump_.*__A5[0-9]0(_M)?$" class="grow basis-[24rem] myinput">
        
        <!--
        <div class="flex flex-row items-center gap-1">
            <span>use regex</span>
            <input spellcheck="false"  type="checkbox" id="tab-regex" class="myinput" ${lg.REGEX_ON? "checked" : ""}></input>
        </div>
        -->
        
        <!--
        <div class="flex flex-row items-center gap-1">
            <span>case insensitive</span>
            <input spellcheck="false"  type="checkbox" id="tab-caseinsensitive" class="myinput" ${lg.CASE_INSENSITIVE? "checked" : ""}></input>
        </div>
        -->
        
        <div class="flex flex-row">
            <span class="pr-1">page</span>
            <input spellcheck="false"  class="myinput" type="number" id="tab-page" min="1" max="5" value="${lg.PAGE}" onKeyDown="checkLength(event)">
            <p id="tab-max-pages">/???</p>
        </div>

        <div>
            <button id="tab-search-button" class="mybutton">Search</button>
            <button id="tab-random" class="mybutton">Random</button>
        </div>

        <div >
            <button class="myicon" id="tab-search-settings" >
            <span class="material-symbols-outlined">
                settings
            </span>
            </button>   
        </div>
        

    </div>

    <div class="flex-1 overflow-auto">
        <table id="browser-table" class=" w-full"></table>
    </div>
        `


     // tippy.js on keypose detect button
     tippy(document.getElementById('tab-search-settings')!, {
        content:  /*html*/`
        <div class="grid grid-cols-2  auto-cols-max  gap-2 ">
            
            <label for="tab-search-settings-basepath">Base path</label>
            <input spellcheck="false"  class="myinput w-[30rem]" size="90" type="text" id="tab-search-settings-basepath" placeholder="/mnt/user/prigplay" value="/mnt/user/prigplay">
        
            <label for="tab-search-settings-sortbydate">Sort by date</label>
            <input  class="mycheckbox" type="checkbox" id="tab-search-settings-sortbydate">

            <label for="tab-search-settings-source">Source</label>
            <select class="myselect" name="tab-search-settings-source" id="tab-search-settings-source">
                <option value="localpaths">Local server paths</option>
                <option value="mongo">MongoDB rg.Moves</option>
            </select>
              
        </div>
        `,
        allowHTML: true,
        interactive: true,
        trigger: 'click',
        placement: 'bottom',
        onCreate(instance) {
            
            (instance.popper.querySelector('#tab-search-settings-basepath') as HTMLInputElement).value = lg.QUERY_BASEPATH;
            (instance.popper.querySelector('#tab-search-settings-basepath') as HTMLElement).onchange = async () => {
                lg.QUERY_BASEPATH = (instance.popper.querySelector('#tab-search-settings-basepath') as HTMLInputElement).value;
            }          

            (instance.popper.querySelector('#tab-search-settings-sortbydate') as HTMLInputElement).checked = lg.SORTBYDATE;
            (instance.popper.querySelector('#tab-search-settings-sortbydate') as HTMLElement).onchange = async () => {
                lg.SORTBYDATE = (instance.popper.querySelector('#tab-search-settings-sortbydate') as HTMLInputElement).checked;
            };

            (instance.popper.querySelector('#tab-search-settings-source') as HTMLSelectElement).value = lg.SOURCE;
            (instance.popper.querySelector('#tab-search-settings-source') as HTMLElement).onchange = async () => {
                lg.SOURCE = (instance.popper.querySelector('#tab-search-settings-source') as HTMLSelectElement).value as "localpaths" | "mongo";
                // run search
                updateCurrentPage(1)
                getTablePage()
            };
        }
 
    });


    
    // <button id="browser-help" class="leading-[0]">
    //     <span class="material-symbols-outlined text-teal-500">
    //     help
    //     </span>
    // </button>
        
    // tippy('#browser-help', {
    //     content: /*html*/`
    //     <p>
    //     <strong>Performance tips</strong>: <br> 
    //     • When "use regex" is enabled, start your query with "^" character (meaning: "starts with"). E.g. "^scared". This is much faster than just "scared".<br>
    //     • "sort by date" can slow down queries. Disable it if you don't need it. <br>
    //     • Filtering by date range can also slow down queries. Disable it if you don't need it (leave the input fields blank). <br>
    //     </p>
    //     <br>
    //     <p> 
    //     <strong>Technical details</strong>: <br>
    //     • By default the whole rg.Moves collection is sorted by date, so the empty query will be sorted by date even with "sort by date" disabled. <br>
    //     • Queries are run against the "MOVE_viewer_search_field" field in rg.Moves. This field is a lowercase concatenation of "MOVE_name" and "MOVE_org_name" fields. <br>
    //     • All queries are case-insensitive for performance reasons. Regex "R_001__A450" is the same thing as "r_001__a450". <br>
    //     </p>
    //     `,
    //     allowHTML: true,
    // });


    //run getCSV() when input button has file
    document.getElementById("tab-random")!.onclick = () => { requestBVH({ random: true, val: lg.QUERY }) }
    // document.getElementById("tab-load-row").onclick = loadAnimFromSelectedRow
    

    document.getElementById("tab-page")!.addEventListener('change', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value);
        
        // if not a number, return
        if (!val){
            return
        }
        
        updateCurrentPage(val)
        getTablePage()
    });

    const tab_search_input = document.getElementById("tab-search-input")!
    tab_search_input.addEventListener("keyup", ({ key }) => {
        if (lg.ISPROCESSINGFILTER){
            return
        }
        lg.QUERY = (tab_search_input as HTMLInputElement).value
        if (key === "Enter" ) {
            // set regex to value of input field
            updateCurrentPage(1)
            getTablePage()
        }
    })

    const tab_search_button = document.getElementById("tab-search-button")!
    tab_search_button.addEventListener("click", () => {
        if (!lg.ISPROCESSINGFILTER) {
            // set regex to value of input field
            lg.QUERY = (tab_search_input as HTMLInputElement).value
            updateCurrentPage(1)
            getTablePage()
        }
    });


    // const tab_regex_button = document.getElementById("tab-regex")! //checkbox
    // tab_regex_button.addEventListener("change", () => {
    //     lg.REGEX_ON = (tab_regex_button as HTMLInputElement).checked
    //     updateCurrentPage(1)
    //     getTablePage()
    // });

    // const tab_dirpath_input = document.getElementById("tab-search-dirpath") as HTMLInputElement;
    // tab_dirpath_input.addEventListener("keyup", ({ key }) => {
    //     lg.DIRPATH = (tab_dirpath_input as HTMLInputElement).value
    // })
    
    getTablePage();

}