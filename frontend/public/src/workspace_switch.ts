
import {g} from "./globals.ts"

const gw:{
    SELECTED_WORKSPACE: number,
    BUTTONS: HTMLButtonElement[]
} = {

    SELECTED_WORKSPACE: g.DEFAULT_WORKSPACE,

    // 1: data-analyzer, 
    // 2: metadata-viewer, 
    // 3: labeller swapped with metadata-viewer
    // 4: labeller hidden
    
    BUTTONS: []
}

export function initWorkspaceSwitch(){

    const div = document.getElementById("workspace-switch")!;
    div.className += " items-center justify-center font-mono flex flex-row gap-3 text-gray-400 leading-none m-1  hover:[&>*]:text-gray-600 [&>*]:font-bold "
    div.innerHTML = /*html*/`
        <button id="workspace-switch-1">1</button>
        <button id="workspace-switch-2">2</button>
        <button id="workspace-switch-3">3</button>
        <button id="workspace-switch-4">4</button>

    `
    
    for (let i = 0; i < div.children.length; i++){
        gw.BUTTONS.push(document.getElementById(`workspace-switch-${i+1}`) as HTMLButtonElement)
        gw.BUTTONS[i].onclick = () => setWorkspace(i+1)
    }

    setWorkspace(gw.SELECTED_WORKSPACE)
}

function swapElements(a: HTMLElement, b: HTMLElement){
    const aParent = a.parentElement!
    const bParent = b.parentElement!
    aParent.replaceChild(b, a)
    bParent.appendChild(a)
}

function setParent(a: HTMLElement, newParent: HTMLElement){
    newParent.appendChild(a)
}

function setPanesRatio(pane1:HTMLDivElement, pane2:HTMLDivElement, ratio: number, vertical = false){
    if (vertical){
        pane1.style.height = `${ratio*100}%`
        pane2.style.height = `${(1-ratio)*100}%`
        return
    }else{
        pane1.style.width = `${ratio*100}%`
        pane2.style.width = `${(1-ratio)*100}%`
    }
}
function setWorkspace(workspace: number){
    gw.SELECTED_WORKSPACE = workspace
    
    gw.BUTTONS.forEach((b) => b.classList.remove("text-gray-900"))
    gw.BUTTONS[gw.SELECTED_WORKSPACE-1].classList.add("text-gray-900")

    const rightPaneDown = document.getElementById("right-pane-down") as HTMLDivElement
    const rightPaneUp = document.getElementById("right-pane-up") as HTMLDivElement
    const leftPaneDown = document.getElementById("left-pane-down") as HTMLDivElement
    const mv = document.getElementById("metadata-viewer")!
    const lb = document.getElementById("labeller")!    
    const da = document.getElementById("data-analyzer")!
    
    switch(workspace ){
        case 1:
            da.classList.remove("hidden")
            mv.classList.remove("hidden")
            lb.classList.add("hidden")
            setParent(mv, rightPaneDown)
            setParent(lb, leftPaneDown)  
            break
        case 2:
        case 4:
            da.classList.add("hidden")
            mv.classList.remove("hidden")
            lb.classList.remove("hidden")
            setParent(mv, leftPaneDown)
            setParent(lb, rightPaneDown)
            break
        case 3:
            da.classList.add("hidden")
            mv.classList.remove("hidden")
            lb.classList.remove("hidden")
            setParent(mv, rightPaneDown)
            setParent(lb, leftPaneDown)            
            break
    }

    if (workspace == 4){
        setPanesRatio(rightPaneUp, rightPaneDown, 1.0, true)

    }else{
        setPanesRatio(rightPaneUp, rightPaneDown, 0.6, true)
    }
}