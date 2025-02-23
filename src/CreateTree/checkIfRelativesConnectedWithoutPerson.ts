import type { TreePerson } from "../types";

export function checkIfRelativesConnectedWithoutPerson(datum: TreePerson, data_stash: TreePerson[]) {
  const r = datum.rels
  const r_ids = [r.father, r.mother, ...(r.spouses || []), ...(r.children || [])].filter(r_id => !!r_id) as string[]
  const rels_not_to_main: string[] = [];

  for (let i = 0; i < r_ids.length; i++) {
    const line = findPersonLineToMain(data_stash.find(d => d.id === r_ids[i])!, [datum])
    if (!line) {rels_not_to_main.push(r_ids[i]!); break;}
  }
  return rels_not_to_main.length === 0;

  function findPersonLineToMain(datum: TreePerson, without_persons: TreePerson[]) {
    let line: TreePerson[] | undefined= undefined;
    if (isM(datum)) line = [datum!]
    checkIfAnyRelIsMain(datum, [datum])
    return line

    function checkIfAnyRelIsMain(d0: TreePerson, history: TreePerson[]) {
      if (line) return
      history = [...history, d0];
      runAllRels(check);
      if (!line) runAllRels(checkRels);

      function runAllRels(f: (id: string)=>void) {
        const r = d0.rels;
        [r.father!, r.mother!, ...(r.spouses || []), ...(r.children || [])]
          .filter(d_id => (d_id && ![...without_persons, ...history].find(d => d.id === d_id)))
          .forEach(d_id => f(d_id));
      }

      function check(d_id: string) {
        if (isM(d_id)) line = history
      }

      function checkRels(d_id:string) {
        const person = data_stash.find(d => d.id === d_id)!
        checkIfAnyRelIsMain(person, history)
      }
    }
  }
  function isM(d0: TreePerson| string) {return typeof d0 === 'object' ? d0.id === data_stash[0]!.id : d0 === data_stash[0]!.id}  // todo: make main more exact
}