const deleteProduct = btn => {
  const productId = btn.parentNode.querySelector("[name=id]").value;
  const csrfToken = btn.parentNode.querySelector("[name=_csrf]").value;
  const productElement = btn.closest("article");
  fetch(`/admin/products/${productId}`,{
    method : "DELETE",
    headers : {
      "csrf-token": csrfToken
    }
  }).then(res => {
    productElement.parentNode.removeChild(productElement);sadadadsada
  })
  .catch(err => {
    console.log(err);
  })
}

