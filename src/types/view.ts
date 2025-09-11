import { TreeDatum } from "./treeData";
import { Link } from "../layout/create-links";
import { Selection, BaseType } from "d3";

export interface CardHtmlSelection extends Selection<HTMLDivElement, TreeDatum, BaseType, unknown> {}

export interface LinkSelection extends Selection<SVGPathElement, Link, BaseType, unknown> {}