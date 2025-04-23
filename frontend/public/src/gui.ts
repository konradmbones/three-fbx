import GUI from 'lil-gui';
import {g} from './globals.ts';
import * as THREE from 'three';


export const GUI_PARAMS = {
    theme: 'light',
    modelSpecular: 0.3,
    modelShiniess: 1,
    lightHemisphereIntensity: 6,
    lightDirectionalIntensity: 3,
    lightHemisphereShadowColor: 0x999999,
    lightHemisphereSkyColor: 0xffffff,
    lightDirectionalColor: 0xffffff,
};

export function initGUI(){    
    
    const gui = new GUI({width:500});
    // gui.add( GUI_PARAMS, 'theme', ["light","dark"] )

    gui.add( GUI_PARAMS, 'modelSpecular', 0,1 ).onChange( (value: number) => {
        g.MODEL3D.object.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
                ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).specular = new THREE.Color(`hsl(0, 0%, ${value * 100}%)`);
            }
        });
    });

    gui.add( GUI_PARAMS, 'modelShiniess', 0,100,1 ).onChange( (value: number) => {
        g.MODEL3D.object.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
                ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).shininess = value;
            }
        });
    }
    );

    gui.add( GUI_PARAMS, 'lightHemisphereIntensity', 0,10,1 ).onChange( (value: number) => {
        g.HEMISPHERE_LIGHT.intensity = value;
    });
    
    gui.addColor( GUI_PARAMS, 'lightHemisphereShadowColor').onChange( (value: number) => {
        g.HEMISPHERE_LIGHT.groundColor = new THREE.Color(value);
    });

    gui.addColor( GUI_PARAMS, 'lightHemisphereSkyColor').onChange( (value: number) => {
        g.HEMISPHERE_LIGHT.color = new THREE.Color(value);
    });

    gui.add( GUI_PARAMS, 'lightDirectionalIntensity', 0,10,1 ).onChange( (value: number) => {
        g.DIRECTIONAL_LIGHT.intensity = value;
    });

    gui.addColor( GUI_PARAMS, 'lightDirectionalColor').onChange( (value: number) => {
        g.DIRECTIONAL_LIGHT.color = new THREE.Color(value);
    });

    // force update of all controllers
    gui.controllersRecursive().forEach(controller => {
        const param = controller.property as keyof typeof GUI_PARAMS;
        controller._onChange(GUI_PARAMS[param]);
    });


    //  detect pressing Ctrl + Alt + 9
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.altKey && e.shiftKey && e.code === "Digit9" ) {
            // drawDebugCube(g.MODEL3D.getRootPosition())
            
            g.STATS.dom.classList.toggle("hidden");
            (gui as any).visible ? gui.hide() : gui.show();
            (gui as any).visible = !(gui as any).visible;
        }
    });
    (gui as any).visible = false;
    gui.hide();

}
