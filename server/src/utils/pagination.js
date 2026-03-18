function parsePagination(query) {
  let page = parseInt(query.page, 10) || 1;
  let pageSize = parseInt(query.pageSize, 10) || 20;
  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 20;
  if (pageSize > 100) pageSize = 100;
  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
    limit: pageSize,
  };
}

module.exports = { parsePagination };
