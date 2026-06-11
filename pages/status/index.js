import useSwr from "swr";

async function fetchApi() {
  const response = await fetch("/api/v1/status");
  const responseBody = await response.json(response);
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSwr("status", fetchApi, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }
  return <div> Última atualização: {updatedAtText}</div>;
}

function DatabaseStatus() {
  const { isLoading, data } = useSwr("status", fetchApi, {
    refreshInterval: 2000,
  });

  let databaseStatusInformation = "Carregando...";

  if (!isLoading && data) {
    console.log(data);
    databaseStatusInformation = (
      <>
        <div>Versão: {data.dependencies.database.version}</div>
        <div>Conexões abertas: {data.in_use_connections}</div>
        <div>Conexões máximas: {data.max_connections}</div>
      </>
    );
  }
  return (
    <>
      <h2>Database</h2>
      <h2>{databaseStatusInformation}</h2>
    </>
  );
}
