const props = {
  gender: "P21",
  first_name: "P735",
  last_name: "P734",
  date_of_birth: "P569",
  male: "Q6581097",
  female: "Q6581072",
  image: "P18",

  father: "P22",
  mother: "P25",
  spouse: "P26",
  child: "P40"
},
  exclusive_props = Object.values(props),
  relative_props = [props.father, props.mother, props.spouse, props.child]

export {
  props,
  exclusive_props,
  relative_props
}