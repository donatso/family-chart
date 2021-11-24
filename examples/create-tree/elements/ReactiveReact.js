import {createTreeJs, getState} from "./Reactive.js"

export default function ReactiveVue(selector) {
  const element = document.querySelector(selector)

  return {update: updateElement}

  function updateElement(store) {
   element.innerText = getComponent(createTreeJs(getState(store)))
  }

  function getComponent(create_tree_js) {
    return (`
import React from "react";
import f3 from "family-chart";  // npm i family-chart
import './family-chart.css';  // create file 'family-chart.css' in same directory, copy/paste css from examples/create-tree

export default class FamilyTree extends React.Component {
  cont = React.createRef();

  componentDidMount() {
    if (!this.cont.current) return;
    ${create_tree_js}
  }

  render() {
    return <div className="f3" id="FamilyChart" ref={this.cont}></div>;
  }
}
    `)
  }
}