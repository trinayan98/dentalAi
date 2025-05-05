import html2pdf from "html2pdf.js";

export const generateBlogPdf = async (blog) => {
  // Create a new div to hold the blog content
  const element = document.createElement("div");
  element.style.padding = "40px";
  element.style.maxWidth = "800px";
  element.style.margin = "0 auto";

  // Add blog title
  const titleElement = document.createElement("h1");
  titleElement.style.fontSize = "24px";
  titleElement.style.marginBottom = "20px";
  titleElement.style.color = "#333";
  titleElement.textContent = blog.title;
  element.appendChild(titleElement);

  // Add author info if available
  if (blog.user) {
    const authorElement = document.createElement("p");
    authorElement.style.fontSize = "14px";
    authorElement.style.color = "#666";
    authorElement.style.marginBottom = "30px";
    authorElement.textContent = `Author: ${blog.user.username}`;
    element.appendChild(authorElement);
  }

  // Add content
  const contentElement = document.createElement("div");
  contentElement.innerHTML = blog.content;
  element.appendChild(contentElement);

  // Add creation date
  const dateElement = document.createElement("p");
  dateElement.style.fontSize = "12px";
  dateElement.style.color = "#999";
  dateElement.style.marginTop = "30px";
  dateElement.textContent = `Created: ${new Date(
    blog.createdAt
  ).toLocaleDateString()}`;
  element.appendChild(dateElement);

  // Configure PDF options
  const opt = {
    margin: [10, 10],
    filename: `${blog.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  try {
    // Generate PDF
    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};
