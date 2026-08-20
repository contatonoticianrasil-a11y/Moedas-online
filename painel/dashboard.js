/* =========================================================
   GONÇALVES CÂMBIO
   GERENCIADOR DE ANÚNCIOS
========================================================= */

const SUPABASE_URL =
  "https://skfodedzzdeptnksufuq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_TDC6NwdHx1XuYhXcFzxkiQ_1N6lLkGE";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const TABLE_NAME = "anuncios";

let anuncios = [];
let anuncioParaExcluir = null;


/* =========================================================
   ELEMENTOS
========================================================= */

const sections = {
  dashboard:
    document.getElementById("section-dashboard"),

  anuncios:
    document.getElementById("section-anuncios"),

  novo:
    document.getElementById("section-novo")
};

const pageTitle =
  document.getElementById("pageTitle");

const pageSubtitle =
  document.getElementById("pageSubtitle");

const usuarioLogado =
  document.getElementById("usuarioLogado");

const adsGrid =
  document.getElementById("adsGrid");

const recentAds =
  document.getElementById("recentAds");

const searchInput =
  document.getElementById("searchInput");

const statusFilter =
  document.getElementById("statusFilter");

const adForm =
  document.getElementById("adForm");

const adId =
  document.getElementById("adId");

const adTitle =
  document.getElementById("adTitle");

const adDescription =
  document.getElementById("adDescription");

const adLink =
  document.getElementById("adLink");

const adImage =
  document.getElementById("adImage");

const adStatus =
  document.getElementById("adStatus");

const formTitle =
  document.getElementById("formTitle");

const formMessage =
  document.getElementById("formMessage");

const saveBtn =
  document.getElementById("saveBtn");

const previewImage =
  document.getElementById("previewImage");

const previewTitle =
  document.getElementById("previewTitle");

const previewDescription =
  document.getElementById("previewDescription");

const toast =
  document.getElementById("toast");


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function abrirSecao(nome) {

  Object.values(sections).forEach(
    section => {
      if (section) {
        section.classList.remove("active");
      }
    }
  );

  if (sections[nome]) {
    sections[nome].classList.add("active");
  }


  document
    .querySelectorAll(".menu-item")
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.section === nome
      );

    });


  if (nome === "dashboard") {

    pageTitle.textContent =
      "Dashboard";

    pageSubtitle.textContent =
      "Gerencie suas propagandas e anúncios.";

  }


  if (nome === "anuncios") {

    pageTitle.textContent =
      "Meus anúncios";

    pageSubtitle.textContent =
      "Gerencie todas as suas propagandas.";

    renderizarAnuncios();

  }


  if (nome === "novo") {

    pageTitle.textContent =
      adId.value
        ? "Editar anúncio"
        : "Novo anúncio";

    pageSubtitle.textContent =
      "Cadastre ou altere uma propaganda.";

  }

}


function novoAnuncio() {

  limparFormulario();

  abrirSecao("novo");

}


/* =========================================================
   LOGIN
========================================================= */

async function verificarLogin() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .auth
        .getSession();


    if (
      error ||
      !data ||
      !data.session
    ) {

      window.location.href =
        "index.html";

      return false;

    }


    usuarioLogado.textContent =
      data.session.user.email ||
      "Administrador";


    return true;

  } catch (error) {

    console.error(
      "Erro ao verificar sessão:",
      error
    );

    window.location.href =
      "index.html";

    return false;

  }

}


/* =========================================================
   CARREGAR ANÚNCIOS
========================================================= */

async function carregarAnuncios() {

  adsGrid.innerHTML = `
    <div class="loading">
      ⏳ Carregando anúncios...
    </div>
  `;


  const {
    data,
    error
  } =
    await supabaseClient
      .from(TABLE_NAME)
      .select("*")
      .order("created_at", {
        ascending: false
      });


  if (error) {

    console.error(
      "Erro ao carregar anúncios:",
      error
    );

    adsGrid.innerHTML = `
      <div class="empty-state">
        <span>⚠️</span>
        <strong>Não foi possível carregar os anúncios</strong>
        <p>
          Verifique se a tabela "anuncios"
          foi criada no Supabase.
        </p>
      </div>
    `;

    anuncios = [];

    atualizarEstatisticas();

    return;

  }


  anuncios =
    data || [];


  atualizarEstatisticas();

  renderizarAnuncios();

  renderizarRecentes();

}


/* =========================================================
   ESTATÍSTICAS
========================================================= */

function atualizarEstatisticas() {

  const total =
    anuncios.length;

  const ativos =
    anuncios.filter(
      anuncio =>
        anuncio.ativo === true
    ).length;

  const comLink =
    anuncios.filter(
      anuncio =>
        anuncio.link &&
        anuncio.link.trim() !== ""
    ).length;

  const comImagem =
    anuncios.filter(
      anuncio =>
        anuncio.imagem &&
        anuncio.imagem.trim() !== ""
    ).length;


  document.getElementById(
    "totalAnuncios"
  ).textContent = total;


  document.getElementById(
    "anunciosAtivos"
  ).textContent = ativos;


  document.getElementById(
    "anunciosComLink"
  ).textContent = comLink;


  document.getElementById(
    "anunciosComImagem"
  ).textContent = comImagem;

}


/* =========================================================
   RENDERIZAR ANÚNCIOS
========================================================= */

function renderizarAnuncios() {

  const busca =
    (searchInput.value || "")
      .toLowerCase()
      .trim();

  const filtro =
    statusFilter.value;


  const filtrados =
    anuncios.filter(
      anuncio => {

        const texto =
          (
            (anuncio.titulo || "") +
            " " +
            (anuncio.descricao || "")
          ).toLowerCase();


        const correspondeBusca =
          !busca ||
          texto.includes(busca);


        let correspondeStatus =
          true;


        if (filtro === "ativos") {

          correspondeStatus =
            anuncio.ativo === true;

        }


        if (filtro === "inativos") {

          correspondeStatus =
            anuncio.ativo !== true;

        }


        return (
          correspondeBusca &&
          correspondeStatus
        );

      }
    );


  if (!filtrados.length) {

    adsGrid.innerHTML = `
      <div class="empty-state">
        <span>📢</span>
        <strong>Nenhum anúncio encontrado</strong>
        <p>
          Crie um anúncio ou altere os filtros.
        </p>
      </div>
    `;

    return;

  }


  adsGrid.innerHTML = "";


  filtrados.forEach(
    anuncio => {

      const card =
        document.createElement("article");

      card.className =
        "ad-card";


      const imagem =
        anuncio.imagem
          ? `
            <img
              src="${escapeHtml(anuncio.imagem)}"
              alt="${escapeHtml(anuncio.titulo || "Anúncio")}"
              onerror="this.style.display='none';this.parentElement.innerHTML='<span class=&quot;no-image&quot;>🖼️</span>';"
            >
          `
          : `<span class="no-image">🖼️</span>`;


      const ativo =
        anuncio.ativo === true;


      card.innerHTML = `

        <div class="ad-image">
          ${imagem}
        </div>

        <div class="ad-body">

          <span class="status-badge ${
            ativo
              ? "status-active"
              : "status-inactive"
          }">
            ${
              ativo
                ? "🟢 ATIVO"
                : "🔴 INATIVO"
            }
          </span>

          <h3>
            ${escapeHtml(
              anuncio.titulo ||
              "Sem título"
            )}
          </h3>

          <p>
            ${escapeHtml(
              anuncio.descricao ||
              "Sem descrição."
            )}
          </p>

          <div class="ad-actions">

            <button
              class="small-btn edit-btn"
              data-action="edit"
              data-id="${anuncio.id}"
            >
              ✏️ Editar
            </button>

            <button
              class="small-btn toggle-btn"
              data-action="toggle"
              data-id="${anuncio.id}"
            >
              ${
                ativo
                  ? "🔴 Desativar"
                  : "🟢 Ativar"
              }
            </button>

            <button
              class="small-btn delete-btn"
              data-action="delete"
              data-id="${anuncio.id}"
            >
              🗑️ Excluir
            </button>

          </div>

        </div>

      `;


      adsGrid.appendChild(card);

    }
  );

}


/* =========================================================
   RECENTES
========================================================= */

function renderizarRecentes() {

  const recentes =
    anuncios.slice(0, 5);


  if (!recentes.length) {

    recentAds.innerHTML = `
      <div class="empty-state">
        <span>📢</span>
        <strong>Nenhum anúncio cadastrado</strong>
        <p>Crie seu primeiro anúncio.</p>
      </div>
    `;

    return;

  }


  recentAds.innerHTML = "";


  recentes.forEach(
    anuncio => {

      const item =
        document.createElement("div");

      item.className =
        "recent-item";


      item.innerHTML = `

        <div>

          <strong>
            ${escapeHtml(
              anuncio.titulo ||
              "Sem título"
            )}
          </strong>

          <span>
            ${
              anuncio.ativo
                ? "Anúncio ativo"
                : "Anúncio inativo"
            }
          </span>

        </div>

        <span class="status-badge ${
          anuncio.ativo
            ? "status-active"
            : "status-inactive"
        }">

          ${
            anuncio.ativo
              ? "ATIVO"
              : "INATIVO"
          }

        </span>

      `;


      recentAds.appendChild(item);

    }
  );

}


/* =========================================================
   FORMULÁRIO
========================================================= */

function limparFormulario() {

  adForm.reset();

  adId.value = "";

  adStatus.value =
    "true";

  formTitle.textContent =
    "Novo anúncio";

  saveBtn.textContent =
    "💾 Salvar anúncio";

  formMessage.textContent = "";

  atualizarPreview();

}


function editarAnuncio(id) {

  const anuncio =
    anuncios.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!anuncio) return;


  adId.value =
    anuncio.id || "";

  adTitle.value =
    anuncio.titulo || "";

  adDescription.value =
    anuncio.descricao || "";

  adLink.value =
    anuncio.link || "";

  adImage.value =
    anuncio.imagem || "";

  adStatus.value =
    anuncio.ativo
      ? "true"
      : "false";


  formTitle.textContent =
    "Editar anúncio";

  saveBtn.textContent =
    "💾 Salvar alterações";


  formMessage.textContent = "";


  atualizarPreview();

  abrirSecao("novo");

}


/* =========================================================
   SALVAR
========================================================= */

async function salvarAnuncio(event) {

  event.preventDefault();


  const titulo =
    adTitle.value.trim();

  const descricao =
    adDescription.value.trim();

  const link =
    adLink.value.trim();

  const imagem =
    adImage.value.trim();

  const ativo =
    adStatus.value === "true";


  if (!titulo) {

    mostrarMensagem(
      "Digite um título para o anúncio.",
      "error"
    );

    return;

  }


  saveBtn.disabled = true;

  saveBtn.textContent =
    "⏳ Salvando...";


  const dados = {

    titulo,

    descricao,

    link,

    imagem,

    ativo

  };


  let resultado;


  if (adId.value) {

    resultado =
      await supabaseClient
        .from(TABLE_NAME)
        .update(dados)
        .eq("id", adId.value);

  } else {

    resultado =
      await supabaseClient
        .from(TABLE_NAME)
        .insert(dados);

  }


  if (resultado.error) {

    console.error(
      "Erro ao salvar:",
      resultado.error
    );


    mostrarMensagem(
      "Erro ao salvar. Verifique a tabela no Supabase.",
      "error"
    );


    saveBtn.disabled = false;

    saveBtn.textContent =
      adId.value
        ? "💾 Salvar alterações"
        : "💾 Salvar anúncio";

    return;

  }


  mostrarMensagem(
    "Anúncio salvo com sucesso!",
    "success"
  );


  mostrarToast(
    "Anúncio salvo com sucesso!"
  );


  await carregarAnuncios();


  setTimeout(
    () => {

      limparFormulario();

      abrirSecao("anuncios");

    },
    600
  );


  saveBtn.disabled = false;

}


/* =========================================================
   ATIVAR / DESATIVAR
========================================================= */

async function alternarAnuncio(id) {

  const anuncio =
    anuncios.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!anuncio) return;


  const novoStatus =
    anuncio.ativo !== true;


  const {
    error
  } =
    await supabaseClient
      .from(TABLE_NAME)
      .update({
        ativo: novoStatus
      })
      .eq("id", id);


  if (error) {

    console.error(
      "Erro ao alterar status:",
      error
    );

    mostrarToast(
      "Não foi possível alterar o status."
    );

    return;

  }


  mostrarToast(
    novoStatus
      ? "Anúncio ativado!"
      : "Anúncio desativado!"
  );


  await carregarAnuncios();

}


/* =========================================================
   EXCLUIR
========================================================= */

function solicitarExclusao(id) {

  anuncioParaExcluir =
    id;

  document
    .getElementById("deleteModal")
    .classList.add("show");

}


async function confirmarExclusao() {

  if (!anuncioParaExcluir) {
    return;
  }


  const id =
    anuncioParaExcluir;


  const {
    error
  } =
    await supabaseClient
      .from(TABLE_NAME)
      .delete()
      .eq("id", id);


  if (error) {

    console.error(
      "Erro ao excluir:",
      error
    );

    mostrarToast(
      "Não foi possível excluir o anúncio."
    );

  } else {

    mostrarToast(
      "Anúncio excluído!"
    );

    await carregarAnuncios();

  }


  fecharModal();

}


function fecharModal() {

  anuncioParaExcluir =
    null;

  document
    .getElementById("deleteModal")
    .classList.remove("show");

}


/* =========================================================
   PREVIEW
========================================================= */

function atualizarPreview() {

  previewTitle.textContent =
    adTitle.value.trim() ||
    "Título do anúncio";


  previewDescription.textContent =
    adDescription.value.trim() ||
    "A descrição do anúncio aparecerá aqui.";


  const imagem =
    adImage.value.trim();


  if (imagem) {

    previewImage.innerHTML = `
      <img
        src="${escapeHtml(imagem)}"
        alt="Prévia do anúncio"
        onerror="this.style.display='none';this.parentElement.innerHTML='🖼️';"
      >
    `;

  } else {

    previewImage.innerHTML =
      "🖼️";

  }

}


/* =========================================================
   MENSAGENS
========================================================= */

function mostrarMensagem(
  texto,
  tipo
) {

  formMessage.textContent =
    texto;

  formMessage.className =
    "form-message " +
    (tipo || "");

}


function mostrarToast(texto) {

  toast.textContent =
    texto;

  toast.classList.add("show");


  setTimeout(
    () => {

      toast.classList.remove("show");

    },
    3000
  );

}


/* =========================================================
   SEGURANÇA BÁSICA DE HTML
========================================================= */

function escapeHtml(valor) {

  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   EVENTOS
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    const autenticado =
      await verificarLogin();


    if (!autenticado) {
      return;
    }


    await carregarAnuncios();


    /* MENU */

    document
      .querySelectorAll(".menu-item")
      .forEach(item => {

        item.addEventListener(
          "click",
          () => {

            abrirSecao(
              item.dataset.section
            );

          }
        );

      });


    /* BOTÕES NOVO */

    document
      .getElementById("newAdBtn")
      .addEventListener(
        "click",
        novoAnuncio
      );


    document
      .getElementById("newAdTopBtn")
      .addEventListener(
        "click",
        novoAnuncio
      );


    /* BOTÃO CANCELAR */

    document
      .getElementById("cancelBtn")
      .addEventListener(
        "click",
        () => {

          limparFormulario();

          abrirSecao("anuncios");

        }
      );


    /* FORM */

    adForm.addEventListener(
      "submit",
      salvarAnuncio
    );


    /* PREVIEW */

    [
      adTitle,
      adDescription,
      adImage
    ].forEach(
      campo => {

        campo.addEventListener(
          "input",
          atualizarPreview
        );

      }
    );


    /* BUSCA */

    searchInput.addEventListener(
      "input",
      renderizarAnuncios
    );


    statusFilter.addEventListener(
      "change",
      renderizarAnuncios
    );


    /* AÇÕES DOS CARDS */

    adsGrid.addEventListener(
      "click",
      event => {

        const botao =
          event.target.closest(
            "button[data-action]"
          );


        if (!botao) return;


        const id =
          botao.dataset.id;

        const action =
          botao.dataset.action;


        if (action === "edit") {

          editarAnuncio(id);

        }


        if (action === "toggle") {

          alternarAnuncio(id);

        }


        if (action === "delete") {

          solicitarExclusao(id);

        }

      }
    );


    /* VER TODOS */

    document
      .querySelectorAll(
        "[data-go-section]"
      )
      .forEach(
        botao => {

          botao.addEventListener(
            "click",
            () => {

              abrirSecao(
                botao.dataset.goSection
              );

            }
          );

        }
      );


    /* MODAL */

    document
      .getElementById("cancelDelete")
      .addEventListener(
        "click",
        fecharModal
      );


    document
      .getElementById("confirmDelete")
      .addEventListener(
        "click",
        confirmarExclusao
      );


    /* LOGOUT */

    document
      .getElementById("logoutBtn")
      .addEventListener(
        "click",
        async () => {

          await supabaseClient
            .auth
            .signOut({
              scope: "local"
            });

          window.location.href =
            "index.html";

        }
      );

  }
);
