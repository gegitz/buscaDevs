'use strict';

const CHECKBOXES = {
  options: [
    { id: 'java', label: 'Java', checked: false },
    { id: 'javascript', label: 'JavaScript', checked: false },
    { id: 'python', label: 'Python', checked: true },
  ],
  fillElementProperties: function (input, span, { id, checked, label }) {
    input.type = 'checkbox';
    input.id = id;
    input.checked = checked;
    input.classList.add('filled-in');
    span.textContent = label;
  },
};

const QUERYOPTIONS = {
  options: [
    { id: 'and', label: 'E', checked: true },
    { id: 'or', label: 'OU', checked: false },
  ],
  fillElementProperties: function (input, span, { id, checked, label }) {
    input.type = 'radio';
    input.name = 'queryOptions';
    input.id = id;
    input.checked = checked;
    input.classList.add('with-gap');
    span.textContent = label;
  },
};

let devs = {};

async function doFetch(uri) {
  try {
    const resource = await fetch(uri);
    const json = await resource.json();
    return json;
  } catch (error) {
    console.log('erro ao executar requisição' + error);
  }
}

async function fetchDevs() {
  function sanatizeProgrammingLanguages(arrayOfProgramingLanguages) {
    const languages = [];
    arrayOfProgramingLanguages.map(({ language }) => {
      languages.push(language);
    });
    return languages;
  }
  // com backend ativo
  //const uri = 'http://localhost:3001/devs'; 

  // servindo estaticamente para gh-pages
  const uri = './backend/devs.json';
  try {
    const ret = await doFetch(uri);
    // com backend ativo
    //const data = ret.map(({ id, name, picture, programmingLanguages }) => {
      const data = ret.devs.map(({ id, name, picture, programmingLanguages }) => {
      return {
        id,
        name,
        normalizedName: name
          .normalize('NFD')
          .replace(/[ \u0300-\u036f]/g, '')
          .toLowerCase(),
        picture,
        languages: sanatizeProgrammingLanguages(programmingLanguages),
      };
    });
    return data;
  } catch (err) {
    console.log(err.msg);
  }
}

function mountQueryOptions(arrayOfOptions) {
  const div = document.querySelector('#search_options');
  arrayOfOptions.options.forEach((option) => {
    const labelElement = document.createElement('label');
    const input = document.createElement('input');
    const span = document.createElement('span');

    arrayOfOptions.fillElementProperties(input, span, option);

    labelElement.appendChild(input);
    labelElement.appendChild(span);
    div.appendChild(labelElement);
  });
}

function doFilter(devsList) {
  const languagesSelected = [];
  document
    .querySelectorAll('#search_options [type=checkbox]:checked + span')
    .forEach((element) => {
      languagesSelected.push(element.textContent);
    });
  const searchValue = document.querySelector('#search_box').value.toLowerCase();
  const filterOption = document
    .querySelector('#search_options [type=radio]:checked + span')
    .textContent.toLowerCase();
  let filteredDevs = devsList.filter((dev) =>
    dev.normalizedName.includes(searchValue)
  );
  filteredDevs = filteredDevs.filter((dev) => {
    return filterOption === 'ou'
      ? languagesSelected.some((item) => dev.languages.includes(item))
      : dev.languages.join('') === languagesSelected.join('');
  });
  return filteredDevs;
}

function renderDevs() {
  const filteredDevs = doFilter(devs);
  const div = document.querySelector('#dev_list');
  div.innerHTML = '';
  const results = document.querySelector('#results');
  results.textContent = `${filteredDevs.length} devs encontrados`;
  filteredDevs.forEach((dev) => {
    const card = document.createElement('div');
    const img = document.createElement('img');
    const span = document.createElement('span');
    const p = document.createElement('p');
    dev.languages.forEach((language) => {
      const lowerCaseLanguage = language.toLowerCase();
      const imgLanguage = document.createElement('img');
      imgLanguage.width = 25;
      imgLanguage.alt = lowerCaseLanguage;
      imgLanguage.src = `./img/${lowerCaseLanguage}.png`;
      p.appendChild(imgLanguage);
    });
    card.classList.add('collection-item', 'avatar', 'col', 's12', 'm6', 'l4');
    img.classList.add('circle');
    img.alt = `${dev.name}_picture`;
    img.src = dev.picture;
    span.classList.add('title');
    span.textContent = dev.name;
    card.appendChild(img);
    card.appendChild(span);
    card.appendChild(p);
    div.appendChild(card);
  });
}

function addEvent() {
  const searchBox = document.querySelector('#search_box');
  const checkboxLanguages = document.querySelectorAll(
    '#search_options [type=checkbox]'
  );
  const radioButtons = document.querySelectorAll(
    '#search_options [type=radio]'
  );

  searchBox.addEventListener('input', renderDevs);
  radioButtons.forEach((radioButton) => {
    radioButton.addEventListener('input', renderDevs);
  });
  checkboxLanguages.forEach((checkbox) => {
    checkbox.addEventListener('input', renderDevs);
  });
}

async function start() {
  mountQueryOptions(CHECKBOXES);
  mountQueryOptions(QUERYOPTIONS);
  addEvent();
  devs = await fetchDevs();
  renderDevs();
}

start();
