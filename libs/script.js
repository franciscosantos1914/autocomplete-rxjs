const {
  fromEvent,
  of,
  ajax: { ajax },
} = rxjs;
const {
  debounceTime,
  map,
  pluck,
  switchMap,
  catchError,
  distinctUntilChanged,
  startWith,
} = rxjs.operators;

//constants and variables
const ul = document.querySelector("ul");
const text = document.querySelector("input");
const input = fromEvent(text, "input");

//functions
const mostraResultado = (res) => {
  ul.innerHTML = res
    .map(
      (e) => `<li class="collection-item teal lighten-2 white-text">${e}</li>`
    )
    .join("");
};
const buscaPaisesNaApi = (termo) =>
  ajax(`https://restcountries.eu/rest/v2/name/${termo}?fields=name`).pipe(
    pluck("response"), //extrai a propriedade response do objecto que veio como resposta da api
    map((resposta) => resposta.map((e) => e.name))
  );

//Observables
input
  .pipe(
    debounceTime(300), //espera até 300 para chamar a função seguinte
    pluck("target", "value"),
    map((e) => e.trim()),
    distinctUntilChanged(),
    switchMap((termo) => {
      if (!termo) return of([]);
      return buscaPaisesNaApi(termo);
    }),
    catchError((err, source) => {
      console.error(err);
      return source.pipe(startWith([]));
    })
  )
  .subscribe(mostraResultado);
