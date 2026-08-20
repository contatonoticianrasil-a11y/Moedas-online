/* =========================================================
   GONÇALVES CÂMBIO
   PAINEL PROFISSIONAL DE PROPAGANDAS
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
   ESTADO
========================================================= */

let anuncios = [];

let anuncioEditando = null;


/* =========================================================
   ELEMENTOS
========================================================= */

const $ = (id) =>
  document.getElementById(id);

const modalOverlay =
  $("modalOverlay");

const adForm =
  $("adForm");

const adsGrid =
  $("adsGrid");

const loading =
  $("loading");

const emptyState =
  $("emptyState");

const searchInput =
  $("searchInput");

const imageInput =
  $("imagem_url");

const imagePreview =
  $("imagePreview");

const previewImg =
  $("previewImg");


/* =========================================================
   TOAST
========================================================= */

function mostrarToast(
  mensagem,
  tipo = "normal"
) {

  const toast =
    $("toast");

  if (!toast) return;

  toast.textContent =
    mensagem;

  toast.className =
    "toast show";

  if (tipo === "erro") {
    toast.style.background =
      "#b91c1c";
  } else if (tipo === "sucesso") {
    toast.style.background =
      "#15803d";
  } else {
    toast.style.background =
      "#07111f";
  }

  clearTimeout(
    window.toastTimer
  );

  window.toastTimer =
    setTimeout(
      () => {
        toast.classList.remove(
          "show"
        );
      },
      3000
    );

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

    if (error) {

      console.error(
        "Erro na sessão:",
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

    const usuario =
      $("usuarioLogado");

    if (usuario) {

      usuario.textContent =
        data.session.user.email ||
        "Administrador";

    }

    return true;

  } catch (erro) {

    console.error(
      "Erro de autenticação:",
      erro
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

  mostrarLoading();

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

    atualizarEstatisticas();

    renderizarAnuncios(
      anuncios
    );

  } catch (erro) {

    console.error(
      "Erro ao carregar anúncios:",
      erro
    );

    esconderLoading();

    adsGrid.innerHTML = `
      <div class="empty"
           style="grid-column:1/-1">

        <div class="empty-icon">
          ⚠️
        </div>

        <h3>
          Não foi possível carregar os anúncios
        </h3>

        <p>
          Verifique a tabela
          <strong>anuncios</strong>
          e as permissões do Supabase.
        </p>

        <small>
          ${escapeHTML(
            erro.message || ""
          )}
        </small>

      </div>
    `;

    mostrarToast(
      "Erro ao carregar anúncios.",
      "erro"
    );

  }

}


/* =========================================================
   LOADING
========================================================= */

function mostrarLoading() {

  if (loading) {

    loading.classList.remove(
      "hidden"
    );

  }

  if (emptyState) {

    emptyState.classList.add(
      "hidden"
    );

  }

  if (adsGrid) {

    adsGrid.innerHTML =
      "";

  }

}


function esconderLoading() {

  if (loading) {

    loading.classList.add(
      "hidden"
    );

  }

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

  const inativos =
    total - ativos;

  if ($("totalAds")) {

    $("totalAds").textContent =
      total;

  }

  if ($("activeAds")) {

    $("activeAds").textContent =
      ativos;

  }

  if ($("inactiveAds")) {

    $("inactiveAds").textContent =
      inativos;

  }

}


/* =========================================================
   RENDERIZAR
========================================================= */

function renderizarAnuncios(
  lista
) {

  esconderLoading();

  if (!lista.length) {

    adsGrid.innerHTML =
      "";

    emptyState.classList.remove(
      "hidden"
    );

    return;

  }

  emptyState.classList.add(
    "hidden"
  );

  adsGrid.innerHTML =
    lista
      .map(
        criarCard
      )
      .join("");

}


/* =========================================================
   CARD
========================================================= */

function criarCard(
  anuncio
) {

  const titulo =
    anuncio.titulo ||
    "Sem título";

  const descricao =
    anuncio.descricao ||
    "Sem descrição";

  const imagem =
    anuncio.imagem_url ||
    "https://placehold.co/800x450/f1f5f9/64748b?text=Goncalves+Cambio";

  const ativo =
    anuncio.ativo === true;

  const status =
    ativo
      ? "Ativo"
      : "Inativo";

  const url =
    anuncio.link_url ||
    "#";

  return `

    <article class="ad-card">

      <div class="ad-image">

        <img
          src="${escapeAttribute(imagem)}"
          alt="${escapeAttribute(titulo)}"
          loading="lazy"
          onerror="
            this.src='https://placehold.co/800x450/f1f5f9/64748b?text=Imagem+indisponivel'
          "
        >

        <span
          class="ad-status ${
            ativo
              ? "active"
              : "inactive"
          }"
        >
          ${ativo ? "🟢" : "🔴"}
          ${status}
        </span>

      </div>


      <div class="ad-content">

        <h3>
          ${escapeHTML(titulo)}
        </h3>

        <p>
          ${escapeHTML(descricao)}
        </p>

        <div class="ad-url">
          🔗
          ${escapeHTML(url)}
        </div>


        <div class="ad-actions">

          <button
            class="edit-btn"
            type="button"
            onclick="editarAnuncio(${Number(anuncio.id)})"
          >
            ✏️ Editar
          </button>

          <button
            class="toggle-btn"
            type="button"
            onclick="
              alternarAnuncio(
                ${Number(anuncio.id)},
                ${!ativo}
              )
            "
          >
            ${ativo
              ? "🔴 Desativar"
              : "🟢 Ativar"}
          </button>

          <button
            class="delete-btn"
            type="button"
            onclick="
              excluirAnuncio(
                ${Number(anuncio.id)}
              )
            "
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

function pesquisar() {

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

  const resultado =
    anuncios.filter(
      anuncio => {

        const texto = [

          anuncio.titulo,
          anuncio.descricao,
          anuncio.link_url

        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return texto.includes(
          termo
        );

      }
    );

  renderizarAnuncios(
    resultado
  );

}


/* =========================================================
   MODAL
========================================================= */

function abrirModal(
  anuncio = null
) {

  anuncioEditando =
    anuncio;

  if (!modalOverlay) return;

  modalOverlay.classList.remove(
    "hidden"
  );

  document.body.style.overflow =
    "hidden";

  if ($("modalTitle")) {

    $("modalTitle").textContent =
      anuncio
        ? "Editar propaganda"
        : "Nova propaganda";

  }

  if (adForm) {

    adForm.reset();

  }

  $("adId").value =
    anuncio?.id || "";

  $("titulo").value =
    anuncio?.titulo || "";

  $("imagem_url").value =
    anuncio?.imagem_url || "";

  $("link_url").value =
    anuncio?.link_url || "";

  $("descricao").value =
    anuncio?.descricao || "";

  $("intervalo_minutos").value =
    anuncio?.tempo_minutos ?? 0;

  $("ativo").checked =
    anuncio
      ? anuncio.ativo === true
      : true;

  atualizarStatusTexto();

  atualizarPreview();

  $("formMessage").textContent =
    "";

}


function fecharModal() {

  if (!modalOverlay) return;

  modalOverlay.classList.add(
    "hidden"
  );

  document.body.style.overflow =
    "";

  anuncioEditando =
    null;

}


/* =========================================================
   PREVIEW
========================================================= */

function atualizarPreview() {

  const url =
    imageInput?.value.trim();

  if (
    !url ||
    !previewImg ||
    !imagePreview
  ) {

    imagePreview?.classList.add(
      "hidden"
    );

    return;

  }

  previewImg.src =
    url;

  imagePreview.classList.remove(
    "hidden"
  );

}


if (imageInput) {

  imageInput.addEventListener(
    "input",
    atualizarPreview
  );

}

if (previewImg) {

  previewImg.addEventListener(
    "error",
    function() {

      imagePreview.classList.add(
        "hidden"
      );

    }
  );

}


/* =========================================================
   STATUS
========================================================= */

function atualizarStatusTexto() {

  const texto =
    $("statusText");

  const ativo =
    $("ativo");

  if (!texto || !ativo) return;

  texto.textContent =
    ativo.checked
      ? "Ativo"
      : "Inativo";

}


$("ativo")?.addEventListener(
  "change",
  atualizarStatusTexto
);


/* =========================================================
   SALVAR
========================================================= */

async function salvarAnuncio(
  event
) {

  event.preventDefault();

  const titulo =
    $("titulo").value.trim();

  const imagem =
    $("imagem_url").value.trim();

  const link =
    $("link_url").value.trim();

  const descricao =
    $("descricao").value.trim();

  const intervalo =
    Number(
      $("intervalo_minutos").value
    );

  const ativo =
    $("ativo").checked;

  const id =
    $("adId").value;


  const mensagem =
    $("formMessage");

  if (!titulo) {

    mensagem.textContent =
      "Digite o título da propaganda.";

    return;

  }

  if (!link) {

    mensagem.textContent =
      "Digite o link da propaganda.";

    return;

  }


  const dados = {

    titulo,

    imagem_url:
      imagem || null,

    link_url:
      link,

    descricao:
      descricao || null,

    ativo,

    tempo_minutos:
      Number.isFinite(intervalo)
        ? Math.max(0, intervalo)
        : 0,

    atualizado_em:
      new Date().toISOString()

  };


  const botao =
    $("saveBtn");

  botao.disabled =
    true;

  botao.textContent =
    "⏳ Salvando...";

  mensagem.textContent =
    "";


  try {

    let resultado;

    if (id) {

      resultado =
        await supabaseClient
          .from("anuncios")
          .update(dados)
          .eq("id", id);

    } else {

      resultado =
        await supabaseClient
          .from("anuncios")
          .insert([
            dados
          ]);

    }

    if (resultado.error) {

      throw resultado.error;

    }

    fecharModal();

    await carregarAnuncios();

    mostrarToast(
      id
        ? "Propaganda atualizada!"
        : "Propaganda criada com sucesso!",
      "sucesso"
    );

  } catch (erro) {

    console.error(
      "Erro ao salvar:",
      erro
    );

    mensagem.textContent =
      erro.message ||
      "Não foi possível salvar.";

    mostrarToast(
      "Não foi possível salvar.",
      "erro"
    );

  } finally {

    botao.disabled =
      false;

    botao.textContent =
      "💾 Salvar anúncio";

  }

}


/* =========================================================
   EDITAR
========================================================= */

async function editarAnuncio(
  id
) {

  const anuncio =
    anuncios.find(
      item =>
        Number(item.id) ===
        Number(id)
    );

  if (anuncio) {

    abrirModal(
      anuncio
    );

    return;

  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("anuncios")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {

      throw error;

    }

    abrirModal(
      data
    );

  } catch (erro) {

    console.error(
      erro
    );

    mostrarToast(
      "Não foi possível abrir o anúncio.",
      "erro"
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
            novoStatus,

          atualizado_em:
            new Date().toISOString()
        })
        .eq(
          "id",
          id
        );

    if (error) {

      throw error;

    }

    await carregarAnuncios();

    mostrarToast(
      novoStatus
        ? "Propaganda ativada."
        : "Propaganda desativada.",
      "sucesso"
    );

  } catch (erro) {

    console.error(
      erro
    );

    mostrarToast(
      "Não foi possível alterar o status.",
      "erro"
    );

  }

}


/* =========================================================
   EXCLUIR
========================================================= */

async function excluirAnuncio(
  id
) {

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

    await carregarAnuncios();

    mostrarToast(
      "Propaganda excluída.",
      "sucesso"
    );

  } catch (erro) {

    console.error(
      erro
    );

    mostrarToast(
      "Não foi possível excluir.",
      "erro"
    );

  }

}


/* =========================================================
   LOGOUT
========================================================= */

async function sair() {

  const botao =
    $("logoutBtn");

  if (botao) {

    botao.disabled =
      true;

    botao.textContent =
      "Saindo...";

  }

  try {

    await supabaseClient
      .auth
      .signOut({
        scope: "local"
      });

  } catch (erro) {

    console.error(
      erro
    );

  }

  window.location.href =
    "index.html";

}


/* =========================================================
   EVENTOS
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    const autenticado =
      await verificarLogin();

    if (!autenticado) return;


    const ano =
      $("year");

    if (ano) {

      ano.textContent =
        new Date()
          .getFullYear();

    }


    $("newAdBtn")?.addEventListener(
      "click",
      () => abrirModal()
    );


    $("emptyNewBtn")?.addEventListener(
      "click",
      () => abrirModal()
    );


    $("closeModalBtn")?.addEventListener(
      "click",
      fecharModal
    );


    $("cancelBtn")?.addEventListener(
      "click",
      fecharModal
    );


    $("refreshBtn")?.addEventListener(
      "click",
      carregarAnuncios
    );


    $("navRefresh")?.addEventListener(
      "click",
      carregarAnuncios
    );


    $("navAds")?.addEventListener(
      "click",
      () => {

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      }
    );


    $("logoutBtn")?.addEventListener(
      "click",
      sair
    );


    adForm?.addEventListener(
      "submit",
      salvarAnuncio
    );


    searchInput?.addEventListener(
      "input",
      pesquisar
    );


    modalOverlay?.addEventListener(
      "click",
      function(event) {

        if (
          event.target ===
          modalOverlay
        ) {

          fecharModal();

        }

      }
    );


    document.addEventListener(
      "keydown",
      function(event) {

        if (
          event.key === "Escape" &&
          !modalOverlay.classList.contains(
            "hidden"
          )
        ) {

          fecharModal();

        }

      }
    );


    await carregarAnuncios();

  }
);


/* =========================================================
   FUNÇÕES GLOBAIS
========================================================= */

window.abrirModal =
  abrirModal;

window.editarAnuncio =
  editarAnuncio;

window.alternarAnuncio =
  alternarAnuncio;

window.excluirAnuncio =
  excluirAnuncio;


/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA
========================================================= */

setInterval(
  function() {

    if (
      document.visibilityState ===
      "visible"
    ) {

      carregarAnuncios();

    }

  },
  5 * 60 * 1000
);
