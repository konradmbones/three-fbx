from pyfbsdk import *

def clear_textures_and_set_color(default_color=FBColor(0.8, 0.8, 0.8)):

    def get_all_models(parent):
        models = []
        for child in parent.Children:
            models.append(child)
            models.extend(get_all_models(child))
        return models

    root = FBSystem().Scene.RootModel
    all_models = get_all_models(root)

    for model in all_models:
        if model and model.Geometry:
            # Jeśli brak materiałów – tworzymy jeden
            if not model.Materials:
                mat = FBMaterial("DefaultMaterial")
                mat.Diffuse = default_color
                model.Materials.append(mat)
            else:
                for mat in model.Materials:
                    mat.DiffuseTexture = None
                    mat.SpecularTexture = None
                    mat.BumpTexture = None
                    mat.EmissiveTexture = None
                    mat.NormalMap = None
                    mat.Diffuse = default_color

    print("✔️ Tekstury usunięte, kolor ustawiony.")

# Użycie:
clear_textures_and_set_color(FBColor(0.75, 0.75, 0.75))  # jasny szary
