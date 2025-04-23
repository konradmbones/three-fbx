import {g} from "./globals.ts";
import {deleteCookies} from "./helpers.ts";
export function initLogoutButton(){
    const button = document.getElementById("logout") as HTMLDivElement;

    button.innerHTML = /*html*/ `
    <button class="mybutton">
        Logout
    </button>
    `;

    // onclick delete cookie and request logout
    button.addEventListener("click", () => {
        deleteCookies();
        window.location.href = "/auth.html";
    });
}