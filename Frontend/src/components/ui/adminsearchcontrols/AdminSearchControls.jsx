import { Form, Button, ButtonGroup, ToggleButton } from "react-bootstrap";
import "./AdminSearchControls.css";

const AdminSearchControls = ({
  viewModeConfig,
  searchTypeConfig,
  searchQueryConfig,
  createButtonConfig,
  clearButtonConfig,
}) => {
  return (
    <div className="d-flex gap-2 mb-4 align-items-center flex-nowrap">
      {viewModeConfig && (
        <ButtonGroup>
          {viewModeConfig.options.map((option) => (
            <ToggleButton
              key={option.value}
              id={`view-${option.value}`}
              type="radio"
              variant="outline-light"
              name="view"
              value={option.value}
              checked={viewModeConfig.viewMode === option.value}
              onChange={(e) => viewModeConfig.onViewModeChange(e.target.value)}
            >
              {option.label}
            </ToggleButton>
          ))}
        </ButtonGroup>
      )}

      {searchTypeConfig && (
        <ButtonGroup>
          {searchTypeConfig.options.map((option) => (
            <ToggleButton
              key={option.value}
              id={`search-${option.value}`}
              type="radio"
              variant="outline-light"
              name="searchType"
              value={option.value}
              checked={searchTypeConfig.searchType === option.value}
              onChange={(e) =>
                searchTypeConfig.onSearchTypeChange(e.target.value)
              }
              style={{ whiteSpace: "nowrap" }}
            >
              {option.label}
            </ToggleButton>
          ))}
        </ButtonGroup>
      )}

      {searchQueryConfig && (
        <Form.Control
          type="text"
          placeholder={searchQueryConfig.placeholder || "Buscar..."}
          value={searchQueryConfig.searchQuery}
          onChange={(e) =>
            searchQueryConfig.onSearchQueryChange(e.target.value)
          }
          className="admin-search-input flex-grow-1"
        />
      )}

      {createButtonConfig && (
        <Button
          variant="outline-light"
          className="admin-search-btn"
          onClick={createButtonConfig.onClick}
          style={{ whiteSpace: "nowrap" }}
        >
          {createButtonConfig.icon} {createButtonConfig.label}
        </Button>
      )}

      {clearButtonConfig && (
        <Button variant="outline-light" onClick={clearButtonConfig.onClick}>
          {clearButtonConfig.label || "Limpiar"}
        </Button>
      )}
    </div>
  );
};

export default AdminSearchControls;
