const fs = require("fs");
const path = require("path");

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (file !== "node_modules" && file !== ".next" && file !== ".git") {
        walk(full, fileList);
      }
    } else if (file.endsWith(".tsx")) {
      fileList.push(full);
    }
  }
  return fileList;
}

const files = walk("./app").concat(walk("./components"));

const results = {
  metalCardWrappingTable: [],
  nativeInputs: [],
  nativeSelects: [],
  filterCardHeaderViolations: [],
  statCardsGridViolations: [],
  statCardsMissingMicroInteractions: [],
  tableMissingReloadButton: [],
  tablePaginationViolations: [],
  actionMenuMissingPortal: []
};

for (const filePath of files) {
  const content = fs.readFileSync(filePath, "utf8");
  const relPath = path.relative(".", filePath).replace(/\\/g, "/");

  // 1. MetalCard wrapping Table (Double border check)
  const metalCardRegex = /<MetalCard[^>]*>([\s\S]*?)<\/MetalCard>/g;
  let match;
  while ((match = metalCardRegex.exec(content)) !== null) {
    if (match[1].includes("<Table")) {
      // Check if Table inside has eliminated its border (border-0 or border-none)
      const hasBorder0 = match[1].includes("border-0") || match[1].includes("border-none");
      if (!hasBorder0) {
        results.metalCardWrappingTable.push({
          file: relPath,
          preview: match[0].substring(0, 150) + "..."
        });
      }
    }
  }

  // 2. Native Inputs (date, time, datetime-local)
  const nativeDate = content.match(/<input[^>]*type=["'](date|time|datetime-local)["'][^>]*>/gi);
  if (nativeDate) {
    results.nativeInputs.push({
      file: relPath,
      matches: nativeDate
    });
  }

  // 3. Native Select
  // Ignore Select import from ui/Select, look for native <select tag
  const nativeSelect = content.match(/<select(\s|>)/g);
  if (nativeSelect) {
    results.nativeSelects.push({
      file: relPath,
      count: nativeSelect.length
    });
  }

  // 4. Filter Card with header or ReloadButton inside
  if (relPath.includes("Filter") || relPath.includes("filter")) {
    if (content.includes("<MetalCard")) {
      const hasReloadInside = content.includes("Table.ReloadButton") || content.includes("onReload");
      const hasTitleInside = /<MetalCard[^>]*>[\s\S]*?<h[1-4][^>]*>/i.test(content);
      if (hasReloadInside || hasTitleInside) {
        results.filterCardHeaderViolations.push({
          file: relPath,
          hasReloadInside,
          hasTitleInside
        });
      }
    }
  }

  // 5. Stat Cards Grid (Mobile single column instead of grid-cols-2)
  if (relPath.includes("Stats") || relPath.includes("stats") || relPath.includes("Overview")) {
    const singleColMobile = content.match(/grid\s+grid-cols-1\s+(sm:|md:)/);
    if (singleColMobile) {
      results.statCardsGridViolations.push({
        file: relPath,
        match: singleColMobile[0]
      });
    }

    // Check if MetalCard icon container or card has micro-interactions
    const hasMicroInteractions =
      content.includes("group-hover:rotate-6") ||
      content.includes("group-hover/card:rotate-6") ||
      content.includes("group-hover:scale-110") ||
      content.includes("group-hover/card:scale-110") ||
      content.includes("hover:-translate-y");
    if (content.includes("<MetalCard") && !hasMicroInteractions && !relPath.includes("Heatmap")) {
      results.statCardsMissingMicroInteractions.push(relPath);
    }
  }

  // 6. Table without ReloadButton in Header
  if (content.includes("<Table") && content.includes("<Table.Header>") && !content.includes("<Table.ReloadButton")) {
    results.tableMissingReloadButton.push(relPath);
  }

  // 7. Table Pagination without meta.totalPages > 1 check
  if (content.includes("<Table.Footer>") && !content.includes("totalPages > 1")) {
    results.tablePaginationViolations.push({
      file: relPath,
      issue: "Table.Footer without totalPages > 1 check (does not auto-hide when 1 page)"
    });
  }

  // 9. Heading with flex (Rule 44 in AGENTS.md)
  const headingWithFlex = content.match(/<h[1-4][^>]*className=["'][^"']*\bflex\b[^"']*["']/g);
  if (headingWithFlex) {
    if (!results.headingWithFlex) results.headingWithFlex = [];
    results.headingWithFlex.push({
      file: relPath,
      matches: headingWithFlex
    });
  }

  // 10. Search Input with internal icon or wrong padding (Rule 45 in AGENTS.md)
  if (content.includes("Search") || content.includes("search")) {
    const searchWithPl = content.match(/<Input[^>]*className=["'][^"']*\b(pl-9|pl-10|pl-11|pl-12)\b[^"']*["']/g);
    if (searchWithPl) {
      if (!results.searchWithInternalIcon) results.searchWithInternalIcon = [];
      results.searchWithInternalIcon.push({
        file: relPath,
        matches: searchWithPl
      });
    }
  }

  // 11. Right Sidebar with border container (Rule 46 in AGENTS.md)
  if (relPath.includes("detail") || relPath.includes("sidebar") || relPath.includes("Drawer") || relPath.includes("Panel")) {
    const hasBorder = content.match(/className=["'][^"']*\b(border-l|border-border|border\s|border-white)\b[^"']*["']/g);
    if (hasBorder && !content.includes("borderless")) {
      if (!results.sidebarWithOuterBorder) results.sidebarWithOuterBorder = [];
      results.sidebarWithOuterBorder.push({
        file: relPath,
        matches: hasBorder.slice(0, 3)
      });
    }
  }

  // 12. Input / Select without standard height h-[42px] or sm:h-[46px]
  if (relPath.includes("Filter") || relPath.includes("Form") || relPath.includes("Modal")) {
    const nonStandardHeight = content.match(/className=["'][^"']*\b(h-9|h-10|h-8|h-12)\b[^"']*["']/g);
    if (nonStandardHeight && (content.includes("<Input") || content.includes("<Select") || content.includes("<InlineSelect"))) {
      if (!results.nonStandardInputHeights) results.nonStandardInputHeights = [];
      results.nonStandardInputHeights.push({
        file: relPath,
        examples: nonStandardHeight.slice(0, 3)
      });
    }
  }
}

fs.writeFileSync(path.join(__dirname, "audit-results.json"), JSON.stringify(results, null, 2), "utf8");
console.log("Audit complete. Results written to scripts/audit-results.json");
