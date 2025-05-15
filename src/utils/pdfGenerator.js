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

export const generateTranscriptionPdf = async (transcription) => {
  // Create a new div to hold the transcription content
  const element = document.createElement("div");
  element.style.padding = "40px";
  element.style.maxWidth = "800px";
  element.style.margin = "0 auto";
  element.style.fontFamily = "Arial, sans-serif";

  // Add transcription title
  const titleElement = document.createElement("h2");
  titleElement.style.fontSize = "24px";
  titleElement.style.marginBottom = "0px";
  titleElement.style.color = "#333";
  titleElement.textContent = transcription.title || transcription.audioFileName;
  element.appendChild(titleElement);

  // Add metadata
  const metadataElement = document.createElement("div");
  metadataElement.style.fontSize = "14px";
  metadataElement.style.color = "#666";
  metadataElement.style.marginBottom = "10px";
  metadataElement.style.display = "flex";
  metadataElement.style.gap = "20px";

  // Add creation date
  const dateElement = document.createElement("span");
  dateElement.textContent = `Created: ${new Date(
    transcription.createdAt
  ).toLocaleDateString()}`;
  metadataElement.appendChild(dateElement);

  // Add language if available
  if (transcription.language) {
    const languageElement = document.createElement("span");
    languageElement.textContent = `Language: ${transcription.language}`;
    metadataElement.appendChild(languageElement);
  }

  element.appendChild(metadataElement);

  // Add transcription content with styling
  const contentElement = document.createElement("div");
  contentElement.style.fontSize = "14px";
  contentElement.style.lineHeight = "1.6";
  contentElement.style.color = "#333";

  // Apply the same styling as prettifyTranscription
  let formattedContent = transcription.transcription || "";

  // Highlight section headers (text between **...**)
  formattedContent = formattedContent.replace(/\*\*(.+?)\*\*/g, (match, p1) => {
    return `<span style="font-weight: bold; font-size: 16px; color: #2563eb; display: block; margin-top: 20px; margin-bottom:8px;">${p1}</span>`;
  });

  // Add line breaks after section headers
  formattedContent = formattedContent.replace(
    /(<span style="[^"]+">.+?<\/span>)/g,
    "$1"
  );

  contentElement.innerHTML = formattedContent;
  element.appendChild(contentElement);

  // Configure PDF options
  const opt = {
    margin: [10, 10],
    filename: `${(
      transcription.title ||
      transcription.audioFileName ||
      "transcription"
    ).replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
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
