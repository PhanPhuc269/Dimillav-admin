document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('search-button');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const actionButton = document.querySelector('.check-all-submit-btn');
    const selectAllOptions = document.querySelector('.select-all-options');
    const accountTableBody = document.getElementById('account-table-body');
    

    let currentPage = 1;
    let currentFilters = {}; // Lưu trữ bộ lọc hiện tại

    updateCurrentFiltersFromURL();
    function updateCurrentFiltersFromURL() {
        const currentUrl = new URL(window.location.href);
        const queryParams = {};
        currentUrl.searchParams.forEach((value, key) => {
            if (key.includes('[')) {
                const [mainKey, subKey] = key.replace(']', '').split('[');
                if (!queryParams[mainKey]) queryParams[mainKey] = {};
                queryParams[mainKey][subKey] = value;
            } else {
                queryParams[key] = value;
            }
        });
        currentFilters = queryParams;
    }
    

    // Tìm kiếm
    searchButton.addEventListener('click', function () {
        const query = document.getElementById('search-query').value;
        fetchAccounts({ query });
    });

    // Chuyển trang
    prevPageButton.addEventListener('click', function () {
        fetchAccounts({ page: currentPage - 1 });
    });

    nextPageButton.addEventListener('click', function () {
        fetchAccounts({ page: currentPage + 1 });
    });

    // Hành động hàng loạt
    actionButton.addEventListener('click', function () {
        const action = selectAllOptions.value;
        if (!action) {
            alert('Vui lòng chọn hành động.');
            return;
        }

        // Thu thập danh sách token từ các checkbox được chọn
        const selectedTokens = Array.from(
            accountTableBody.querySelectorAll('input[name="accounts[]"]:checked')
        ).map(checkbox => checkbox.dataset.token);

        if (selectedTokens.length === 0) {
            alert('Vui lòng chọn ít nhất một tài khoản.');
            return;
        }

        if (action === 'block') {
            performBulkBan(selectedTokens);
        } else if (action === 'delete') {
            performBulkDelete(selectedTokens);
        } else if(action === 'unblock') {
            performBulkUnBan(selectedTokens);
        } else {
            alert('Hành động không hợp lệ.');
        }
        fetchAccounts(currentFilters);
    });

    // Sắp xếp
    document.querySelectorAll('a[data-field]').forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const field = this.dataset.field;
            const currentType = this.dataset.type;
            const nextType = currentType === 'asc' ? 'desc' : 'asc';

            fetchAccounts({ _sort: { column: field, type: nextType }, page: 1 });
            updateSortIcons(field, nextType);
        });
    });

    // Hàm fetch dữ liệu tài khoản
    function fetchAccounts(params = {}) {
        // Kết hợp các tham số mới với bộ lọc hiện tại
        currentFilters = { ...currentFilters, ...params };

        const url = new URL('/account', window.location.origin);
        Object.keys(currentFilters).forEach(key => {
            if (typeof currentFilters[key] === 'object') {
                Object.keys(currentFilters[key]).forEach(subKey => {
                    url.searchParams.append(`${key}[${subKey}]`, currentFilters[key][subKey]);
                });
            } else {
                url.searchParams.append(key, currentFilters[key]);
            }
        });

        // Cập nhật URL
        window.history.pushState({}, '', url);

        fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(response => response.json())
            .then(data => {
                renderAccounts(data.accounts);
                updatePagination(data.page, data.totalPages);
                updateSortIcons(data.sortField, data.sortOrder);
            });
        checkAllSubmitBtn.addClass('disabled');
    }


    // Hàm render danh sách tài khoản
    function renderAccounts(accounts) {
        accountTableBody.innerHTML = accounts
            .map(account => `
            <tr>
                <td><input class="form-check-input" type="checkbox" name="accounts[]" data-token="${account.token}"></td>
                <td>${account.name}</td>
                <td>${account.email}</td>
                <td>${account.phone}</td>
                <td>${account.role}</td>
                <td>${account.registrationTime}</td>
                <td>${account.status}</td>
                <td>
                    <a class="btn btn-sm btn-primary" href="/account/details/${account.username}">Xem</a>

                    <a href="#" class="btn btn-sm ${account.status !='active' ? 'btn-success' : 'btn-danger'} ban-button" data-bs-toggle="modal" data-status="${account.status}" data-token="${account.token}" data-name="{{this.username}}" data-bs-target=${account.status !='active' ? '#unban-account-modal' : '#ban-account-modal'}> ${account.status !='active' ? 'Mở khóa' : 'Khóa'}</a>
                </td>
            </tr>
        `).join('');
    }

    // Hàm cập nhật phân trang
    function updatePagination(page, totalPages) {
        currentPage = page;
        document.querySelector('.pagination-info').textContent = 'Page ' + page + ' of ' + totalPages;
        prevPageButton.disabled = page <= 1;
        nextPageButton.disabled = page >= totalPages;
    }

    // Hàm cập nhật biểu tượng sắp xếp
    function updateSortIcons(sortField, sortOrder) {
        document.querySelectorAll('a[data-field]').forEach(link => {
            const field = link.dataset.field;
            const icon = link.querySelector('i');
            if (field === sortField) {
                icon.className =
                    sortOrder === 'asc'
                        ? 'fa-solid fa-arrow-down-short-wide'
                        : 'fa-solid fa-arrow-down-wide-short';
                link.dataset.type = sortOrder;
            } else {
                icon.className = 'fa-solid fa-sort';
                link.dataset.type = 'default';
            }
        });
    }

    // Lắng nghe sự kiện quay lại
    window.addEventListener('popstate', function () {
        const currentUrl = new URL(window.location.href);
        const queryParams = {};
        currentUrl.searchParams.forEach((value, key) => {
            queryParams[key] = value;
        });
        currentFilters = queryParams; // Cập nhật bộ lọc hiện tại
        fetchAccounts(queryParams);
    });

    var token;

    $('#ban-account-modal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);  // Nút kích hoạt modal
        token = button.data('token');  // Lấy account ID từ data-id
    });
    $('#unban-account-modal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);  // Nút kích hoạt modal
        token = button.data('token');  // Lấy account ID từ data-id
    });
    document.getElementById('btn-ban-account').addEventListener('click', function () {  
        $('#ban-account-modal').modal('hide');  
        banAccount(token);
    });
    document.getElementById('btn-unban-account').addEventListener('click', function () {    
        $('#unban-account-modal').modal('hide');
        unbanAccount(token);
    });
    async function banAccount(token) {
        try {
            const response = await fetch('/account/ban-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const result = await response.json();
            if (response.ok) {
                alert('Account successfully banned.');
                fetchAccounts({ page: currentPage });
            } else {
                alert(`Error banning account: ${result.message}`);
            }
        } catch (error) {
            console.error('Error banning account:', error);
            alert('Failed to ban account.');
        }
    }
    async function unbanAccount(token) {
        try {
            const response = await fetch('/account/unban-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const result = await response.json();
            if (response.ok) {
                alert('Account successfully unbanned.');
                fetchAccounts({ page: currentPage });
            } else {
                alert(`Error unbanning account: ${result.message}`);
            }
        } catch (error) {
            console.error('Error unbanning account:', error);
            alert('Failed to ban account.');
        }
    }
    var checkboxAll=$('#checkbox-all');
    var accountItemsCheckbox= $('input[name="accounts[]"]');
    var checkAllSubmitBtn=$('.check-all-submit-btn');

    checkboxAll.change(function(){
        if($(this).is(':checked')){
            $('.form-check-input').prop('checked',true);
        }else{
            $('.form-check-input').prop('checked',false);
        }
    })
    accountItemsCheckbox.change(function(){
        var bool=($('input[name="accountIds[]"]:checked').length==accountItemsCheckbox.length)
        $('#checkbox-all').prop('checked',bool);
    })

    checkAllSubmitBtn.on('submit', function(e){
        e.preventDefault();
        if($(this).hasClass('disable')){
            return;
        }
        containerForm.submit();
        
    })
    $('#account-table-body').on('change', '.form-check-input', function () {
        renderCheckAllSubmitBtn();
    });
    function renderCheckAllSubmitBtn(){
        var accountItemsCheckbox= $('input[name="accounts[]"]:checked');
        if(accountItemsCheckbox.length>0){
            checkAllSubmitBtn.removeClass('disabled');
        }else{
            checkAllSubmitBtn.addClass('disabled');
        }
    }

    // Hàm khóa hàng loạt tài khoản
    function performBulkBan(tokens) {
        fetch('/account/bulk-ban', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ tokens }),
        })
            .then(response => {
                if (response.ok) {
                    alert('Tài khoản đã được khóa thành công.');
                    fetchAccounts(); // Cập nhật lại danh sách
                }
                else {
                    alert('Không thể khóa tài khoản: ' + response.data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Có lỗi xảy ra khi khóa tài khoản.');
            });
    }
   // Hàm khóa hàng loạt tài khoản
   function performBulkUnBan(tokens) {
        fetch('/account/bulk-unban', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ tokens }),
        })
            .then(response => {
                if (response.ok) {
                    alert('Tài khoản đã được khóa thành công.');
                    fetchAccounts(); // Cập nhật lại danh sách
                }
                else {
                    alert('Không thể khóa tài khoản: ' + response.data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Có lỗi xảy ra khi khóa tài khoản.');
            });
    }
    // Hàm xóa hàng loạt tài khoản
    function performBulkDelete(tokens) {
        fetch('/api/accounts/bulk-delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ tokens }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Tài khoản đã được xóa thành công.');
                    fetchAccounts(); // Cập nhật lại danh sách
                } else {
                    alert('Không thể xóa tài khoản: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Có lỗi xảy ra khi xóa tài khoản.');
            });
    }
});
