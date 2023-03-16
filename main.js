// variables
//env
const token = import.meta.env.VITE_DATA_API;
const url = import.meta.env.VITE_DATA_URL;
//input
const party = document.querySelector('#party');
const nameShort = document.querySelector('#name_short');
const nameFull = document.querySelector('#name_full');
const innKpp = document.querySelector('#inn_kpp');
const address = document.querySelector('#address');
//dropdown
const suggestion = document.querySelector('.suggestion');
const suggestionList = document.querySelector('.suggestion ul');

let timer;
let waitSuggTimer = 1000;
party.value = '';
let partyValue = '';

// listening when the user stop typing to search the company names
party.addEventListener('keyup', event => {
	if (event.key === 'Backspace') {
		suggestion.classList.remove('show');
		suggestionList.innerHTML = '';
	}
	// grab the party value
	partyValue = event.target.value;

	// clear setTimeout
	clearTimeout(timer);

	timer = setTimeout(async () => {
		await search(partyValue);
	}, waitSuggTimer);
});

// search for dropwdown menu
const search = async query => {
	// if input is empty do nothing
	if (!query) {
		return;
	}

	// http request
	const suggestions = await HTTPRequest(query);

	// if daData return empty array do nothing
	if (!suggestions.length) {
		return;
	}

	// convert array => html-list
	const listHTML = suggestions
		.map(item => {
			return `<li>${item.value}</li>`;
		})
		.join('');

	// insert html-list to HTML
	suggestion.classList.add('show');
	suggestionList.insertAdjacentHTML('beforeend', listHTML);

	// choose company
	const suggestionListItem = document.querySelectorAll('.suggestion li');
	suggestionListItem.forEach(list => {
		list.addEventListener('click', async event => {
			const listValue = event.target.innerText;

			// hiding dropdown menu
			partyValue = '';
			suggestion.classList.remove('show');
			suggestionList.innerHTML = '';

			// http request
			const data = await HTTPRequest(listValue);

			// if daData return empty array do nothing
			if (!data.length) {
				return;
			}

			// grabbing exact item
			const exactItem = data[0];

			// paste all info in inputs
			party.value = exactItem.value;
			nameShort.value = exactItem.data.name.full_with_opf;
			nameFull.value = exactItem.data.name.short_with_opf;
			innKpp.value = `${exactItem.data.inn} / ${exactItem.data.kpp}`;
			address.value = exactItem.data.address.value;
		});
	});
};

const HTTPRequest = async query => {
	const res = await fetch(url, {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: 'Token ' + token,
		},
		body: JSON.stringify({ query }),
	});
	const { suggestions } = await res.json();
	return suggestions;
};
