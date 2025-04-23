
import { g } from './globals.ts';
import { setFrameIndicator as setFrameIndicatorL } from './labeller/setFrameIndicator.ts';
import {setFrameIndicator as setFrameIndicatorDA} from './data_analysis/setFrameIndicator.ts';
import { frameToPercent, clamp } from './helpers.ts';

export function setFrame(frame:number, _clamp=false) {
  if (_clamp) {
    frame = clamp(frame, 0, g.MODEL3D.anim.maxFrame);
  }
  g.FRAME = frame;
  // stop playing
  g.PLAYING = false;
  // change current frame
  (document.getElementById("currentFrame") as HTMLElement).innerText = `${frame}`;
  refreshPlayingButton();
  
  // set frame indicator for labeller
  setFrameIndicatorL(frameToPercent(frame));
  setFrameIndicatorDA(frameToPercent(frame));
  refreshPlayingButton();
}

function refreshFrameText() {
  (document.getElementById("maxFrame") as HTMLElement).innerText = `/ ${g.MODEL3D.anim.maxFrame}`;
  (document.getElementById("timelineSlider") as HTMLInputElement).max = (g.MODEL3D.anim.maxFrame + 1).toString();
  (document.getElementById("timelineSlider") as HTMLInputElement).value = g.FRAME.toString();
  
}

function refreshPlayingButton() {
  if (g.PLAYING) {
    (document.getElementById("pauseButton") as HTMLButtonElement).style.display = "block";
    (document.getElementById("playButton") as HTMLButtonElement).style.display = "none";
    // color the play button
    // document.getElementById("playButton").classList.add("text-teal-400");
  } else {
    (document.getElementById("playButton") as HTMLButtonElement).style.display = "block";
    (document.getElementById("pauseButton") as HTMLButtonElement).style.display = "none";
    // color the play button
    // document.getElementById("playButton").classList.remove("text-teal-400");
  }
}

function refreshFollowButton() {
  if (g.CAMCON.following) {
    // color the follow button
    (document.getElementById("followButton") as HTMLButtonElement).classList.add("text-teal-400");
  } else {
    // color the follow button
    (document.getElementById("followButton") as HTMLButtonElement).classList.remove("text-teal-400");
  }
}

export function initTimeline() {

    const defaultGray = "text-gray-400"

    const timeline = document.getElementById("timeline") as HTMLElement;
    timeline.className += " w-full flex flex-row justify-end leading-none ";
    timeline.innerHTML = /*html*/ `
        <div id="timelineBar"
          class="flex w-full h-10 flex-row flex-between px-2 gap-3  rounded-lg justify-center items-center">

          <!-- skeleton button -->
          <div class="myicon">
            <button class="" title="Show skeleton">
              <span id="skeletonButton" class="material-symbols-outlined">
                skull
              </span>
            </button>
          </div>

          <!-- orthographic button -->
          <div class="myicon">
            <button class="" title="Enable orthographic camera">
              <span id="orthoButton" class="material-symbols-outlined">
              deployed_code
              </span>
            </button>
          </div>
          

          <!-- follow button -->
          <div class="myicon">
            <button class="" title="Follow 3D model">
              <span class="material-symbols-outlined" id="followButton">
                center_focus_strong
              </span>
            </button>
          </div>

          <!-- play button -->
          <div class="myicon">
            <!-- IN THE FINAL VERSION THIS SHOULD BE A BUTTON -->
            <button class="">
              <span hidden id="playButton" class="material-symbols-outlined">
                play_arrow
              </span>
              <span id="pauseButton" class="material-symbols-outlined">
                pause
              </span>
            </button>
          </div>


          <!-- timeline slider -->
          <div class="grow flex flex-col items-center ">
            <input spellcheck="false"  id="timelineSlider" type="range" value="1" min="1" max="100" step="1"
              class="slider w-full h-1 leading-none bg-gray-500 bg-opacity-20  appearance-none cursor-pointer ">
          </div>

          <!-- current frame info -->
          <div class="  text-right	w-[10ch]	">
            <span class="${defaultGray}  whitespace-pre w-[4ch] " id="currentFrame">1000</span>
            <span class="${defaultGray} w-[6ch] " id="maxFrame">/ 234</span>
          </div>


        </div>
    `;



  refreshFollowButton();
  refreshPlayingButton();


  const viewport = document.getElementById("3d-viewport") as HTMLElement;
  // on viewport spacebar press, stop playing
  viewport.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      g.PLAYING = !g.PLAYING;
      refreshPlayingButton();
    }
  });

  // on viewport arrow right press, go to next frame
  // on viewport arrow left press, go to previous frame
  viewport.addEventListener("keydown", (e) => {
    if (e.code === "ArrowRight") {
      setFrame(g.FRAME + 1, true);
    } else if (e.code === "ArrowLeft") {
      setFrame(g.FRAME - 1, true);
    }
  }); 

  // on timeline slider arrow right press, go to next frame
  // on timeline slider arrow left press, go to previous frame
  (document.getElementById("timelineSlider") as HTMLInputElement).addEventListener("keydown", (e) => {
    if (e.code === "ArrowRight") {
      e.preventDefault();
      setFrame(g.FRAME + 1, true);
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      setFrame(g.FRAME - 1, true);
    }
  });



  // on pressing the play button, start playing
  (document.getElementById("playButton") as HTMLButtonElement).addEventListener("click", () => {
    g.PLAYING = !g.PLAYING;
    refreshPlayingButton();
  });

  // on pressing the pause button, stop playing
  (document.getElementById("pauseButton") as HTMLButtonElement).addEventListener("click", () => {
    g.PLAYING = !g.PLAYING;
    refreshPlayingButton();
  });

  // on pressing the follow button, start following
  (document.getElementById("followButton") as HTMLButtonElement).addEventListener("click", () => {
    g.CAMCON.following = !g.CAMCON.following;
    refreshFollowButton();
  });

  // on timeline slider change, set frame
  (document.getElementById("timelineSlider") as HTMLInputElement).addEventListener("input", (e : Event) => {
    setFrame(parseInt((e.target as HTMLInputElement).value) - 1);
  });


  function refreshSkeletonButton() {
    if (g.MODEL3D.skeletonHelper.visible) {
      (document.getElementById("skeletonButton") as HTMLButtonElement).classList.add("text-teal-400");
    } else {
      (document.getElementById("skeletonButton") as HTMLButtonElement).classList.remove("text-teal-400");
    }
  }

  // on pressing skeleton button, show/hide skeleton
  (document.getElementById("skeletonButton") as HTMLButtonElement).addEventListener("click", () => {
    g.MODEL3D.skeletonHelper.visible = !g.MODEL3D.skeletonHelper.visible;
    refreshSkeletonButton();

  });

  refreshSkeletonButton();


  //// ortho button
  function refreshOrthoButton() {
    if (g.CAMCON.camera.isOrthographicCamera) {
      (document.getElementById("orthoButton") as HTMLButtonElement).classList.remove("text-teal-400");
      g.CAMCON.setCameraMode("perspective");
    } else {
      (document.getElementById("orthoButton") as HTMLButtonElement).classList.add("text-teal-400");
      g.CAMCON.setCameraMode("ortho");
    }
  }
  // on pressing ortho button, show/hide ortho
  (document.getElementById("orthoButton") as HTMLButtonElement).addEventListener("click", () => {
    refreshOrthoButton();
  });

  refreshOrthoButton();



  // make timeline bar visible
  (document.getElementById("timeline") as HTMLElement).style.visibility = "visible";


  g.UPDATE_LOOP["viewport"] = () => {
    // round to int (we don't show fractional values in the UI)
    const frame = Math.round(g.FRAME);
    (document.getElementById("currentFrame") as HTMLElement).innerText = frame.toString();
    (document.getElementById("timelineSlider") as HTMLInputElement).value = frame.toString();
    setFrameIndicatorL( frameToPercent(frame) );
    setFrameIndicatorDA(frameToPercent(frame) );
    refreshFrameText();
  };


}
