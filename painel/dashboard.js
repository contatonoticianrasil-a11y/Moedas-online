/* =========================================================
   GONÇALVES CÂMBIO
   DASHBOARD DE PROPAGANDAS
   Compatível com dashboard.html V2
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
   ELEMENTOS
========================================================= */

const usuarioLogado =
  document.getElementById("usuarioLogado");

const totalAds =
  document.getElementById("totalAds");

const activeAds =
  document.getElementById("activeAds");

const inactiveAds =
  document.getElementById("inactiveAds");

const adsGrid =
  document.getElementById("adsGrid");

const loading =
  document.getElementById("loading");

const emptyState =
  document.getElementById("emptyState");

const searchInput =
  document.getElementById("searchInput");

const refreshBtn =
  document.getElementById("refreshBtn");

const refreshMenu =
  document.getElementById("refreshMenu");

const newAdBtn =
  document.getElementById("newAdBtn");

const emptyNewBtn =
  document.getElementById("emptyNewBtn");

const logoutBtn =
  document.getElementById("logoutBtn");

const modalOverlay =
  document.getElementById("modalOverlay");

const closeModalBtn =
  document.getElementById("closeModalBtn");

const cancelBtn =
  document.getElementById("cancelBtn");

const adForm =
  document.getElementById("adForm");

const modalTitle =
  document.getElementById("modalTitle");

const adId =
  document.getElementById("adId");

const titulo =
  document.getElementById("titulo");

const imagemUrl =
  document.getElementById("imagem_url");

const linkUrl =
  document.getElementById("link_url");

const descricao =
  document.getElementById("descricao");

const intervaloMinutos =
  document.getElementById("intervalo_minutos");

const ativo =
  document.getElementById("ativo");

const statusText =
  document.getElementById("statusText");

const imagePreview =
  document.getElementById("imagePreview");

const previewImg =
  document.getElementById("previewImg");

const formMessage =
  document.getElementById("formMessage");

const saveBtn =
  document.getElementById("saveBtn");

const toast =
  document.getElementById("toast");

const year =
  document.getElementById("year");


/* =========================================================
   ESTADO
========================================================= */

let anuncios = [];


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    if (year) {

      year.textContent =
        new Date().getFullYear();

    }

    const autenticado =
      await verificarLogin();

    if (!autenticado) return;

    configurarEventos();

    await carregarAnuncios();

  }
);


/* =========================================================
   LOGIN
========================================================= */

async function verificarLogin() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();

    if (error) {

      console.error(
        "Erro Supabase Auth:",
        error
      );

      window.location.href =
        "index.html";

      return false;

    }

    if (
      !data ||
      !data.session
    ) {

      window.location.href =
        "index.html";

      return false;

    }

    if (usuarioLogado) {

      usuarioLogado.textContent =
        data.session.user.email ||
        "Administrador";

    }

    return true;

  } catch (erro) {

    console.error(
      "Erro ao verificar login:",
      erro
    );

    window.location.href =
      "index.html";

    return false;

  }

}


/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {

  if (newAdBtn) {

    newAdBtn.addEventListener(
      "click",
      () => abrirModal()
    );

  }


  if (emptyNewBtn) {

    emptyNewBtn.addEventListener(
      "click",
      () => abrirModal()
    );

  }


  if (refreshBtn) {

    refreshBtn.addEventListener(
      "click",
      carregarAnuncios
    );

  }


  if (refreshMenu) {

    refreshMenu.addEventListener(
      "click",
      event => {

        event.preventDefault();

        carregarAnuncios();

      }
    );

  }


  if (closeModalBtn) {

    closeModalBtn.addEventListener(
      "click",
      fecharModal
    );

  }


  if (cancelBtn) {

    cancelBtn.addEventListener(
      "click",
      fecharModal
    );

  }


  if (modalOverlay) {

    modalOverlay.addEventListener(
      "click",
      event => {

        if (
          event.target === modalOverlay
        ) {

          fecharModal();

        }

      }
    );

  }


  if (adForm) {

    adForm.addEventListener(
      "submit",
      salvarAnuncio
    );

  }


  if (logoutBtn) {

    logoutBtn.addEventListener(
      "click",
      sair
    );

  }


  if (searchInput) {

    searchInput.addEventListener(
      "input",
      filtrarAnuncios
    );

  }


  if (imagemUrl) {

    imagemUrl.addEventListener(
      "input",
      atualizarPreview
    );

  }


  if (ativo) {

    ativo.addEventListener(
      "change",
      atualizarTextoStatus
    );

  }


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        fecharModal();

      }

    }
  );

}


/* =========================================================
   CARREGAR ANÚNCIOS
========================================================= */

async function carregarAnuncios() {

  mostrarLoading(true);

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("anuncios")
        .select("*")
        .order(
          "id",
          {
            ascending: false
          }
        );

    if (error) {

      throw error;

    }

    anuncios =
      data || [];

    atualizarEstatisticas(
      anuncios
    );

    renderizarAnuncios(
      anuncios
    );

  } catch (erro) {

    console.error(
      "Erro ao carregar anúncios:",
      erro
    );

    mostrarErro(
      erro
    );

  } finally {

    mostrarLoading(false);

  }

}


/* =========================================================
   ESTATÍSTICAS
========================================================= */

function atualizarEstatisticas(lista) {

  const total =
    lista.length;

  const ativos =
    lista.filter(
      anuncio =>
        anuncio.ativo === true
    ).length;

  const inativos =
    total - ativos;

  if (totalAds) {

    totalAds.textContent =
      total;

  }

  if (activeAds) {

    activeAds.textContent =
      ativos;

  }

  if (inactiveAds) {

    inactiveAds.textContent =
      inativos;

  }

}


/* =========================================================
   RENDERIZAR
========================================================= */

function renderizarAnuncios(lista) {

  if (!adsGrid) return;

  if (!lista.length) {

    adsGrid.innerHTML = "";

    if (emptyState) {

      emptyState.classList.remove(
        "hidden"
      );

    }

    return;

  }

  if (emptyState) {

    emptyState.classList.add(
      "hidden"
    );

  }

  adsGrid.innerHTML =
    lista
      .map(
        anuncio =>
          criarCard(anuncio)
      )
      .join("");

}


/* =========================================================
   CARD
========================================================= */

function criarCard(anuncio) {

  const imagem =
    anuncio.imagem_url ||
    "https://placehold.co/800x400/111827/ffffff?text=Goncalves+Cambio";

  const tituloSeguro =
    escapeHTML(
      anuncio.titulo ||
      "Sem título"
    );

  const descricaoSegura =
    escapeHTML(
      anuncio.descricao ||
      "Sem descrição"
    );

  const linkSeguro =
    escapeHTML(
      anuncio.link_url ||
      ""
    );

  const ativoAtual =
    anuncio.ativo === true;

  const status =
    ativoAtual
      ? "Ativo"
      : "Inativo";

  const statusClasse =
    ativoAtual
      ? "status-ativo"
      : "status-inativo";

  return `

    <article class="ad-card">

      <div class="ad-image">

        <img
          src="${escapeAttribute(imagem)}"
          alt="${escapeAttribute(tituloSeguro)}"
          loading="lazy"
          onerror="this.src='https://placehold.co/800x400/111827/ffffff?text=Imagem+indisponivel'"
        >

        <span class="${statusClasse}">
          ${status}
        </span>

      </div>


      <div class="ad-content">

        <h3>
          ${tituloSeguro}
        </h3>

        <p>
          ${descricaoSegura}
        </p>

        ${
          linkSeguro
            ? `
              <div class="ad-link">
                🔗
                <span>
                  ${linkSeguro}
                </span>
              </div>
            `
            : ""
        }


        <div class="ad-footer">

          <button
            type="button"
            class="edit-btn"
            onclick="editarAnuncio(${Number(anuncio.id)})"
          >
            ✏️ Editar
          </button>


          <button
            type="button"
            class="toggle-btn"
            onclick="alternarAnuncio(
              ${Number(anuncio.id)},
              ${!ativoAtual}
            )"
          >
            ${
              ativoAtual
                ? "🔴 Desativar"
                : "🟢 Ativar"
            }
          </button>


          <button
            type="button"
            class="delete-btn"
            onclick="excluirAnuncio(${Number(anuncio.id)})"
          >
            🗑️ Excluir
          </button>

        </div>

      </div>

    </article>

  `;

}


/* =========================================================
   PESQUISA
========================================================= */

function filtrarAnuncios() {

  const termo =
    (
      searchInput?.value ||
      ""
    )
      .trim()
      .toLowerCase();

  if (!termo) {

    renderizarAnuncios(
      anuncios
    );

    return;

  }

  const filtrados =
    anuncios.filter(
      anuncio => {

        const titulo =
          String(
            anuncio.titulo || ""
          ).toLowerCase();

        const descricao =
          String(
            anuncio.descricao || ""
          ).toLowerCase();

        return (
          titulo.includes(termo) ||
          descricao.includes(termo)
        );

      }
    );

  renderizarAnuncios(
    filtrados
  );

}


/* =========================================================
   ABRIR MODAL
========================================================= */

function abrirModal(anuncio = null) {

  if (!modalOverlay) return;

  limparMensagem();

  if (adForm) {

    adForm.reset();

  }

  if (adId) {

    adId.value =
      anuncio
        ? anuncio.id
        : "";

  }

  if (titulo) {

    titulo.value =
      anuncio?.titulo ||
      "";

  }

  if (imagemUrl) {

    imagemUrl.value =
      anuncio?.imagem_url ||
      "";

  }

  if (linkUrl) {

    linkUrl.value =
      anuncio?.link_url ||
      "";

  }

  if (descricao) {

    descricao.value =
      anuncio?.descricao ||
      "";

  }

  if (intervaloMinutos) {

    intervaloMinutos.value =
      anuncio?.tempo_minutos ??
      0;

  }

  if (ativo) {

    ativo.checked =
      anuncio
        ? anuncio.ativo === true
        : true;

  }

  if (modalTitle) {

    modalTitle.textContent =
      anuncio
        ? "Editar propaganda"
        : "Nova propaganda";

  }

  atualizarTextoStatus();

  atualizarPreview();

  modalOverlay.classList.remove(
    "hidden"
  );

  document.body.classList.add(
    "modal-open"
  );

}


/* =========================================================
   FECHAR MODAL
========================================================= */

function fecharModal() {

  if (!modalOverlay) return;

  modalOverlay.classList.add(
    "hidden"
  );

  document.body.classList.remove(
    "modal-open"
  );

  limparMensagem();

}


/* =========================================================
   PREVIEW
========================================================= */

function atualizarPreview() {

  const url =
    imagemUrl?.value.trim();

  if (
    !url ||
    !imagePreview ||
    !previewImg
  ) {

    imagePreview?.classList.add(
      "hidden"
    );

    return;

  }

  previewImg.src =
    url;

  previewImg.onload =
    () => {

      imagePreview.classList.remove(
        "hidden"
      );

    };

  previewImg.onerror =
    () => {

      imagePreview.classList.add(
        "hidden"
      );

    };

}


/* =========================================================
   STATUS
========================================================= */

function atualizarTextoStatus() {

  if (!statusText || !ativo) return;

  statusText.textContent =
    ativo.checked
      ? "Ativo"
      : "Inativo";

}


/* =========================================================
   SALVAR
========================================================= */

async function salvarAnuncio(event) {

  event.preventDefault();

  limparMensagem();

  const id =
    adId?.value.trim();

  const tituloValor =
    titulo?.value.trim();

  const imagemValor =
    imagemUrl?.value.trim();

  const linkValor =
    linkUrl?.value.trim();

  const descricaoValor =
    descricao?.value.trim();

  const intervaloValor =
    Number(
      intervaloMinutos?.value ||
      0
    );

  const ativoValor =
    ativo?.checked ?? true;


  if (!tituloValor) {

    mostrarMensagem(
      "Digite o título da propaganda.",
      "error"
    );

    return;

  }


  if (!linkValor) {

    mostrarMensagem(
      "Digite o link da propaganda.",
      "error"
    );

    return;

  }


  if (
    intervaloValor < 0 ||
    !Number.isFinite(
      intervaloValor
    )
  ) {

    mostrarMensagem(
      "O intervalo precisa ser 0 ou maior.",
      "error"
    );

    return;

  }


  const dados = {

    titulo:
      tituloValor,

    imagem_url:
      imagemValor ||
      null,

    link_url:
      linkValor,

    descricao:
      descricaoValor ||
      null,

    ativo:
      ativoValor,

    tempo_minutos:
      Math.max(
        0,
        Math.floor(
          intervaloValor
        )
      )

  };


  if (saveBtn) {

    saveBtn.disabled =
      true;

    saveBtn.textContent =
      "⏳ Salvando...";

  }


  try {

    let resultado;

    if (id) {

      resultado =
        await supabaseClient
          .from("anuncios")
          .update(dados)
          .eq(
            "id",
            id
          );

    } else {

      resultado =
        await supabaseClient
          .from("anuncios")
          .insert(
            [dados]
          );

    }


    if (resultado.error) {

      throw resultado.error;

    }


    fecharModal();

    mostrarToast(
      id
        ? "Propaganda atualizada com sucesso!"
        : "Propaganda criada com sucesso!",
      "success"
    );

    await carregarAnuncios();


  } catch (erro) {

    console.error(
      "Erro ao salvar:",
      erro
    );

    mostrarMensagem(
      "Não foi possível salvar: " +
      erro.message,
      "error"
    );

  } finally {

    if (saveBtn) {

      saveBtn.disabled =
        false;

      saveBtn.textContent =
        "💾 Salvar propaganda";

    }

  }

}


/* =========================================================
   EDITAR
========================================================= */

async function editarAnuncio(id) {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("anuncios")
        .select("*")
        .eq(
          "id",
          id
        )
        .single();

    if (error) {

      throw error;

    }

    abrirModal(
      data
    );

  } catch (erro) {

    console.error(
      "Erro ao editar:",
      erro
    );

    mostrarToast(
      "Não foi possível abrir a propaganda.",
      "error"
    );

  }

}


/* =========================================================
   ATIVAR / DESATIVAR
========================================================= */

async function alternarAnuncio(
  id,
  novoStatus
) {

  try {

    const {
      error
    } =
      await supabaseClient
        .from("anuncios")
        .update({
          ativo:
            Boolean(
              novoStatus
            )
        })
        .eq(
          "id",
          id
        );

    if (error) {

      throw error;

    }

    mostrarToast(
      novoStatus
        ? "Propaganda ativada."
        : "Propaganda desativada.",
      "success"
    );

    await carregarAnuncios();

  } catch (erro) {

    console.error(
      "Erro ao alterar status:",
      erro
    );

    mostrarToast(
      "Não foi possível alterar o status.",
      "error"
    );

  }

}


/* =========================================================
   EXCLUIR
========================================================= */

async function excluirAnuncio(id) {

  const confirmar =
    window.confirm(
      "Tem certeza que deseja excluir esta propaganda?"
    );

  if (!confirmar) return;


  try {

    const {
      error
    } =
      await supabaseClient
        .from("anuncios")
        .delete()
        .eq(
          "id",
          id
        );

    if (error) {

      throw error;

    }

    mostrarToast(
      "Propaganda excluída.",
      "success"
    );

    await carregarAnuncios();

  } catch (erro) {

    console.error(
      "Erro ao excluir:",
      erro
    );

    mostrarToast(
      "Não foi possível excluir a propaganda.",
      "error"
    );

  }

}


/* =========================================================
   LOGOUT
========================================================= */

async function sair() {

  if (logoutBtn) {

    logoutBtn.disabled =
      true;

    logoutBtn.innerHTML =
      "⏳ Saindo...";

  }

  try {

    await supabaseClient
      .auth
      .signOut({
        scope: "local"
      });

  } catch (erro) {

    console.error(
      "Erro ao sair:",
      erro
    );

  }

  window.location.href =
    "index.html";

}


/* =========================================================
   LOADING
========================================================= */

function mostrarLoading(valor) {

  if (!loading) return;

  if (valor) {

    loading.classList.remove(
      "hidden"
    );

  } else {

    loading.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   ERRO
========================================================= */

function mostrarErro(erro) {

  if (!adsGrid) return;

  if (emptyState) {

    emptyState.classList.add(
      "hidden"
    );

  }

  adsGrid.innerHTML = `

    <div class="error-state">

      <div class="empty-icon">
        ⚠️
      </div>

      <h3>
        Não foi possível carregar
      </h3>

      <p>
        Verifique a tabela
        <strong>anuncios</strong>
        e as permissões do Supabase.
      </p>

      <small>
        ${escapeHTML(
          erro?.message ||
          "Erro desconhecido"
        )}
      </small>

    </div>

  `;

}


/* =========================================================
   MENSAGEM DO FORMULÁRIO
========================================================= */

function mostrarMensagem(
  mensagem,
  tipo = "error"
) {

  if (!formMessage) return;

  formMessage.textContent =
    mensagem;

  formMessage.className =
    "form-message " +
    tipo;

}


/* =========================================================
   LIMPAR MENSAGEM
========================================================= */

function limparMensagem() {

  if (!formMessage) return;

  formMessage.textContent =
    "";

  formMessage.className =
    "form-message";

}


/* =========================================================
   TOAST
========================================================= */

function mostrarToast(
  mensagem,
  tipo = "success"
) {

  if (!toast) {

    alert(
      mensagem
    );

    return;

  }

  toast.textContent =
    mensagem;

  toast.className =
    "toast " +
    tipo +
    " show";

  setTimeout(
    () => {

      toast.classList.remove(
        "show"
      );

    },
    3500
  );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(valor) {

  return String(
    valor ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


function escapeAttribute(valor) {

  return escapeHTML(
    valor
  );

}
