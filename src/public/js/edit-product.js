    // Tạo thẻ link để tải CSS động
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/edit-product.css';
    document.head.appendChild(link);
    // Mở modal hiển thị ảnh
    function openImageModal(imageUrl) {
        const modal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        modalImage.src = imageUrl;
        modal.style.display = 'flex';
    }

    // Đóng modal
    function closeModal() {
        const modal = document.getElementById('image-modal');
        modal.style.display = 'none';
    }

    //Lấy slug sản phẩm từ url
    const url = window.location.pathname;
    const slug = url.substring(url.lastIndexOf('/') + 1);

    
    
    // Function to remove an image
    function removeImage(event, index) {
        event.stopPropagation();
        fetch(`/product/remove-image/${slug}/${index}`, { method: 'Delete' }) // Replace with your actual API endpoint
            .then(response =>{
                if(response.status==200)
                {
                    showToast('Xóa ảnh thành công', 'success', 'Success');

                    // Xóa phần tử HTML tương ứng khỏi giao diện
                    const imageItem = document.getElementById(`image-item-${index}`);
                    if (imageItem) {
                        imageItem.remove();
                    }
                }
                else
                {
                    showToast('Xóa ảnh thất bại', 'error', 'Error');
                }
            })
            .then(data => {
                if (data.success) {
                    window.location.reload(); // Reload page to reflect changes
                } else {
                    alert('Failed to remove image');
                }
            });
    }