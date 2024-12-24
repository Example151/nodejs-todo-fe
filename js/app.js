let itemList = '#item-list';
let btnToggleForm = '#btn-toggle-form';
let formAddItem = '#form-add-item';
let inputId = '#input-id';
let inputKeyword = '#input-keyword';
let inputName = '#input-name';
let inputStatus = '#input-status';
let sortField = '#sort-field';
let btnSearch = '#btn-search';
let API_URL = 'http://localhost:3000/api/v1/';

let params = {};
params.sortField = 'name';
params.sortType = 'asc';
params.keyword = '';

const ITEM_STATUS = [
    { name: 'Low', status: 'low', class: 'primary' },
    { name: 'Medium', status: 'medium', class: 'warning' },
    { name: 'High', status: 'high', class: 'danger' }
];

$(document).ready(() => {
    showItems(params);

    $(btnToggleForm).click(() => {
        let isShow = $(btnToggleForm).data('toggle');
        $(btnToggleForm).data('toggle', !isShow);
        toggleForm(!isShow);
    });

    $('#btn-submit').click(() => {
        if ($(inputId).val()) {
            updateItem($(inputId).val());
        } else {
            addItem();
        }
    });

    $('#btn-cancel').click(() => {
        toggleForm(false);
        resetForm();
    });

    $(btnSearch).click(() => {
        params.keyword = $(inputKeyword).val();
        showItems(params);
    });
});

$(document).on('click', '.sort-field', function() {
    let sortField = $(this).data('sort-by');
    let sortType = $(this).data('sort-type');
    params.sortField = sortField;
    params.sortType = sortType;

    showItems(params);
});

showItems = (params = null) => {
    let url = '';

    if (params && params.sortField) {
        url += `sortField=${params.sortField}&sortType=${params.sortType}`;
    }

    if (params && params.keyword) {
        url += `&keyword=${params.keyword}`;
    }

    $(sortField).text(params.sortField.toUpperCase() + ' - ' + params.sortType.toUpperCase());

    $.getJSON(API_URL + 'items?' + url, (response) => {
        let content = '';

        if (response.success) {
            $.map(response.data, (item, index) => {
                let name = item.name;
                if (params && params.keyword) {
                    name = name.replace(new RegExp(params.keyword, 'ig'), (match) => {
                        return `<mark>${match}</mark>`;
                    });
                }

                content += `<tr class="align-middle">
                                <td>${index + 1}</td>
                                <td>${name}</td>
                                <td>${showItemStatus(item.status)}</td>
                                <td>
                                    <a onclick="editItem('${item.id}')" class="btn btn-warning">Edit</a>
                                    <a onclick="deleteItem('${item.id}')" class="btn btn-danger">Delete</a>
                                </td>
                            </tr>`;
            });
            $(itemList).html(content);
        }
    });
}

showItemStatus = (status) => {
    const itemStatus = ITEM_STATUS.find(item => item.status === status);
    return itemStatus ? `<span class="badge text-bg-${itemStatus.class}">${itemStatus.name}</span>` : '';
}

toggleForm = (isShow = true) => {
    if (isShow) {
        $(formAddItem).removeClass('d-none');
        $(btnToggleForm).text('Close');
        $(btnToggleForm).removeClass('btn-primary');
        $(btnToggleForm).addClass('btn-danger');
    } else {
        $(formAddItem).addClass('d-none');
        $(btnToggleForm).text('Add task');
        $(btnToggleForm).removeClass('btn-danger');
        $(btnToggleForm).addClass('btn-primary');
    }
}

addItem = async () => {
    if ($(inputName).val().trim()) {
        let taskName = $(inputName).val();
        let taskStatus = $(inputStatus).val();

        const response = await fetch(API_URL + 'items/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: taskName, status: taskStatus })
        });

        if (response.status === 201) {
            showItems();
            toggleForm(false);
            resetForm();
        } else {
            alert('Failed to add item, please try again');
        }
    } else {
        alert('Please input Task name');
    }
}

resetForm = () => {
    $(inputId).val('');
    $(inputName).val('');
    $(inputStatus).val('low');
    $(btnToggleForm).data('toggle', false);
}

deleteItem = async (id) => {
    let confirm = window.confirm('Are you sure you want to delete this item?');

    if (confirm) {
        const response = await fetch(API_URL + 'items/delete/' + id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            showItems();
        }
    }
}

editItem = async (id) => {
    toggleForm();
    $.getJSON(API_URL + 'items/' + id, function (response) {
        if (response.success) {
            $(inputName).val(response.data[0].name);
            $(inputStatus).val(response.data[0].status);
            $(inputId).val(response.data[0].id);
        } else {
            alert(response.message);
        }
    });
}

updateItem = async (id) => {
    let taskName = $(inputName).val();
    let taskStatus = $(inputStatus).val();

    if ($(inputName).val().trim()) {
        const response = await fetch(API_URL + `edit/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: taskName, status: taskStatus })
        });

        if (response.status === 200) {
            showItems();
            toggleForm(false);
            resetForm();
        }
    } else {
        alert('Please input Task name');
    }
}