import { Model } from "./model";
import { SettingsView } from "./views/settingsView";
import { AddView } from "./views/addView";
import { ListView } from "./views/listView";

import "./main.css";

const model = new Model();

const root = document.querySelector("div#app") as HTMLDivElement;

const main = document.createElement("div");
main.id = "main";

main.appendChild(new SettingsView(model).root);
main.appendChild(new AddView(model).root);
main.appendChild(new ListView(model).root);

root.appendChild(main);

