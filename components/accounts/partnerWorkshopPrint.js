export function preparePartnerWorkshopPrint(source, target) {
  if (!source || !target) return false;

  const header = source.querySelector(":scope > header");
  const footer = source.querySelector(":scope > footer");

  if (!header || !footer) return false;

  const sections = Array.from(source.children).filter(
    (element) => element.tagName === "SECTION"
  );

  const customer = sections[0];
  const notes = sections.find((section) => section.querySelector("textarea"));
  const totals = sections.find((section) =>
    section.textContent.includes("Subtotal /")
  );

  const tables = Array.from(source.querySelectorAll("table"));

  target.replaceChildren();

  const createPage = () => {
    const page = document.createElement("article");
    page.className = "invoice-paper cw-a4-page cw-partner-page";
    page.appendChild(header.cloneNode(true));

    if (customer) page.appendChild(customer.cloneNode(true));

    target.appendChild(page);
    return page;
  };

  let page = createPage();

  const contentLimit = (297 - 5.08) * (96 / 25.4) - 20;

  const exceeds = () => {
    const children = Array.from(page.children);
    const last = children[children.length - 1];
    return (
      last.getBoundingClientRect().bottom -
      page.getBoundingClientRect().top >
      contentLimit
    );
  };

  for (const originalTable of tables) {
    const originalSection = originalTable.closest("section");
    const heading = originalSection?.querySelector("h3");

    let section = document.createElement("section");
    section.className = "cw-a4-items-section";

    if (heading) section.appendChild(heading.cloneNode(true));

    let table = originalTable.cloneNode(false);
    table.className = "cw-a4-items-table";

    const thead = originalTable.querySelector("thead");
    if (thead) table.appendChild(thead.cloneNode(true));

    let tbody = document.createElement("tbody");
    table.appendChild(tbody);
    section.appendChild(table);
    page.appendChild(section);

    for (const originalRow of originalTable.querySelectorAll("tbody > tr")) {
      const row = originalRow.cloneNode(true);
      tbody.appendChild(row);

      if (exceeds()) {
        tbody.removeChild(row);

        if (!tbody.children.length) section.remove();

        page = createPage();

        section = document.createElement("section");
        section.className = "cw-a4-items-section";

        if (heading) section.appendChild(heading.cloneNode(true));

        table = originalTable.cloneNode(false);
        table.className = "cw-a4-items-table";

        if (thead) table.appendChild(thead.cloneNode(true));

        tbody = document.createElement("tbody");
        table.appendChild(tbody);
        section.appendChild(table);
        page.appendChild(section);
        tbody.appendChild(row);

        if (exceeds()) {
          target.replaceChildren();
          return false;
        }
      }
    }
  }

  const bottom = document.createElement("div");
  bottom.className = "cw-partner-bottom";

  if (totals) bottom.appendChild(totals.cloneNode(true));
  if (notes) bottom.appendChild(notes.cloneNode(true));
  bottom.appendChild(footer.cloneNode(true));

  page.appendChild(bottom);

  if (exceeds()) {
    bottom.remove();
    page = createPage();
    page.appendChild(bottom);

    if (exceeds()) {
      target.replaceChildren();
      return false;
    }
  }

  const pages = Array.from(target.querySelectorAll(".cw-partner-page"));

  pages.forEach((printedPage, index) => {
    if (pages.length > 1) {
      const number = document.createElement("div");
      number.className = "cw-a4-page-number";
      number.textContent = `Page ${index + 1}/${pages.length}`;
      printedPage.appendChild(number);
    }
  });

  return true;
}
