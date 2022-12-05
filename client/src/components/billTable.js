module.exports = (bill) => {
  return `<table style="border:2px solid black">
  <thead>
    <tr>
      <th style="width: 10%" scope="col">
        S no.
      </th>
      <th style="width: 40%" scope="col">
        Item
      </th>
      <th style="width: 10%" scope="col">
        Price
      </th>
      <th style="width: 20%" scope="col">
        Quantity
      </th>
      <th style="width: 20%" scope="col">
        Amount
      </th>
    </tr>
  </thead>
  <tbody>
    ${bill.order
      .map((item, i) => {
        return `<tr key=${i}>
          <th scope="row">${i + 1}</th>
          <td align="left">${item.item}</td>
          <td> ${item.price} </td>
          <td>${item.quantity}</td>
          <td>${item.price * item.quantity}</td>
        </tr>`;
      })
      .join("")}
    <tr>
      <td />
      <td />
      <td />
      <td />
      <th>${bill.sum}</th>
    </tr>
  </tbody>
</table>`;
};
