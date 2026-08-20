/* =========================================================
   GONÇALVES CÂMBIO
   DASHBOARD - SISTEMA DE PROPAGANDAS
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

const listaAnuncios =
  document.getElementById("listaAnuncios");

const totalAnuncios =
  document.getElementById("totalAnuncios");

const ativosAnuncios =
  document.getElementById("ativosAnuncios");

const inativosAnuncios =
  document.getElementById("inativosAnuncios");

const formAnuncio =
  document.getElementById("formAnuncio");

const modalAnuncio =
  document.getElementById("modalAnuncio");

const abrirModalBtn =
  document.getElementById("abrirModalBtn");

const fecharModalBtn =
  document.getElementById("fecharModalBtn");

const cancelarBtn =
  document.getElementById("cancelarBtn");

const atualizarBtn =
  document.getElementById("atualizarBtn");

const logoutBtn =
  document.getElementById("logoutBtn");


/* =========================================================
   VERIFICAR LOGIN
========================================================= */

async function verificarLogin() {

  const {
    data,
    error
  } = await supabaseClient.auth.getSession();

  if (error) {

    console.error(
      "Erro ao verificar sessão:",
      error
    );

    window.location.href = "index.html";

    return false;
  }

  if (!data.session) {

    window.location.href = "index.html";

    return false;
  }

  const usuario =
    document.getElementById("usuarioLogado");

  if (usuario) {

    usuario.textContent =
      data.session.user.email ||
      "Administrador";

  }

  return true;
}


/* =========================================================
   CARREGAR ANÚNCIOS
========================================================= */

async function carregarAnuncios() {

  if (!listaAnuncios) return;

  listaAnuncios.innerHTML = `
    <div class="loading">
      ⏳ Carregando propagandas...
    </div>
  `;

  const {
    data,
    error
  } = await supabaseClient
    .from("anuncios")
    .select("*")
    .order("id", {
      ascending: false
    });

  if (error) {

    console.error(
      "Erro ao carregar anúncios:",
      error
    );

    listaAnuncios.innerHTML = `
      <div class="error">
        ❌ Erro ao carregar propagandas.
        <br>
        <small>${escapeHTML(error.message)}</small>
      </div>
    `;

    return;
  }

  atualizarResumo(data || []);

  if (!data || data.length === 0) {

    listaAnuncios.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📢</div>

        <h3>
          Nenhuma propaganda cadastrada
        </h3>

        <p>
          Comece criando sua primeira propaganda.
        </p>

        <button
          type="button"
          class="primary-btn"
          onclick="abrirModal()"
        >
          ＋ Criar propaganda
        </button>
      </div>
    `;

    return;
  }

  listaAnuncios.innerHTML =
    data.map(
      anuncio => criarCardAnuncio(anuncio)
    ).join("");

}


/* =========================================================
   RESUMO
========================================================= */

function atualizarResumo(anuncios) {

  const total =
    anuncios.length;

  const ativos =
    anuncios.filter(
      anuncio => anuncio.ativo === true
    ).length;

  const inativos =
    total - ativos;

  if (totalAnuncios) {

    totalAnuncios.textContent =
      total;

  }

  if (ativosAnuncios) {

    ativosAnuncios.textContent =
      ativos;

  }

  if (inativosAnuncios) {

    inativosAnuncios.textContent =
      inativos;

  }

}


/* =========================================================
   CRIAR CARD
========================================================= */

function criarCardAnuncio(anuncio) {

  const imagem =
    anuncio.imagem_url ||
    "https://via.placeholder.com/600x300?text=Goncalves+Cambio";

  const status =
    anuncio.ativo === true
      ? "Ativo"
      : "Inativo";

  const classeStatus =
    anuncio.ativo === true
      ? "status-ativo"
      : "status-inativo";

  return `

    <article class="ad-card">

      <div class="ad-image">

        <img
          src="${escapeAttribute(imagem)}"
          alt="${escapeAttribute(anuncio.titulo || "Propaganda")}"
          onerror="this.src='https://via.placeholder.com/600x300?text=Imagem+indisponivel'"
        >

        <span class="${classeStatus}">
          ${status}
        </span>

      </div>


      <div class="ad-content">

        <h3>
          ${escapeHTML(anuncio.titulo || "Sem título")}
        </h3>

        <p>
          ${escapeHTML(anuncio.descricao || "Sem descrição")}
        </p>


        <div class="ad-link">

          🔗

          <span>
            ${escapeHTML(anuncio.link_url || "")}
          </span>

        </div>


        <div class="ad-footer">

          <button
            type="button"
            class="edit-btn"
            onclick="editarAnuncio(${anuncio.id})"
          >
            ✏️ Editar
          </button>


          <button
            type="button"
            class="toggle-btn"
            onclick="alternarAnuncio(${anuncio.id}, ${!anuncio.ativo})"
          >
            ${anuncio.ativo ? "🔴 Desativar" : "🟢 Ativar"}
          </button>


          <button
            type="button"
            class="delete-btn"
            onclick="excluirAnuncio(${anuncio.id})"
          >
            🗑️ Excluir
          </button>

        </div>

      </div>

    </article>

  `;
}


/* =========================================================
   ABRIR MODAL
========================================================= */

function abrirModal(anuncio = null) {

  if (!modalAnuncio) return;

  modalAnuncio.classList.add("active");

  if (!formAnuncio) return;

  formAnuncio.reset();

  const id =
    document.getElementById("anuncioId");

  const titulo =
    document.getElementById("titulo");

  const imagem =
    document.getElementById("imagemUrl");

  const link =
    document.getElementById("linkUrl");

  const descricao =
    document.getElementById("descricao");

  const intervalo =
    document.getElementById("tempoMinutos");

  const ativo =
    document.getElementById("ativo");

  if (id) {

    id.value =
      anuncio ? anuncio.id : "";

  }

  if (titulo) {

    titulo.value =
      anuncio?.titulo || "";

  }

  if (imagem) {

    imagem.value =
      anuncio?.imagem_url || "";

  }

  if (link) {

    link.value =
      anuncio?.link_url || "";

  }

  if (descricao) {

    descricao.value =
      anuncio?.descricao || "";

  }

  if (intervalo) {

    intervalo.value =
      anuncio?.tempo_minutos ?? 0;

  }

  if (ativo) {

    ativo.checked =
      anuncio
        ? anuncio.ativo
        : true;

  }

}


/* =========================================================
   FECHAR MODAL
========================================================= */

function fecharModal() {

  if (modalAnuncio) {

    modalAnuncio.classList.remove("active");

  }

}


/* =========================================================
   SALVAR ANÚNCIO
========================================================= */

async function salvarAnuncio(event) {

  event.preventDefault();

  const id =
    document.getElementById("anuncioId")?.value;

  const titulo =
    document.getElementById("titulo")?.value.trim();

  const imagem =
    document.getElementById("imagemUrl")?.value.trim();

  const link =
    document.getElementById("linkUrl")?.value.trim();

  const descricao =
    document.getElementById("descricao")?.value.trim();

  const intervalo =
    Number(
      document.getElementById("tempoMinutos")?.value || 0
    );

  const ativo =
    document.getElementById("ativo")?.checked ?? true;


  if (!titulo) {

    alert("Digite o título da propaganda.");

    return;
  }

  if (!link) {

    alert("Digite o link da propaganda.");

    return;
  }


  const dados = {

    titulo: titulo,

    imagem_url:
      imagem || null,

    link_url:
      link,

    descricao:
      descricao || null,

    ativo:
      ativo,

    tempo_minutos:
      Number.isFinite(intervalo)
        ? Math.max(0, intervalo)
        : 0,

    atualizado_em:
      new Date().toISOString()

  };


  const botao =
    formAnuncio.querySelector(
      'button[type="submit"]'
    );


  if (botao) {

    botao.disabled = true;

    botao.textContent =
      "⏳ Salvando...";

  }


  let resultado;


  try {

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
          .insert([dados]);

    }


    if (resultado.error) {

      throw resultado.error;

    }


    fecharModal();

    await carregarAnuncios();

    alert(
      id
        ? "Propaganda atualizada com sucesso!"
        : "Propaganda criada com sucesso!"
    );


  } catch (erro) {

    console.error(
      "Erro ao salvar propaganda:",
      erro
    );

    alert(
      "Não foi possível salvar.\n\n" +
      erro.message
    );


  } finally {

    if (botao) {

      botao.disabled = false;

      botao.textContent =
        "💾 Salvar propaganda";

    }

  }

}


/* =========================================================
   EDITAR
========================================================= */

async function editarAnuncio(id) {

  const {
    data,
    error
  } = await supabaseClient
    .from("anuncios")
    .select("*")
    .eq("id", id)
    .single();


  if (error) {

    console.error(
      "Erro ao buscar anúncio:",
      error
    );

    alert(
      "Não foi possível carregar a propaganda."
    );

    return;
  }


  abrirModal(data);

}


/* =========================================================
   ATIVAR / DESATIVAR
========================================================= */

async function alternarAnuncio(
  id,
  novoStatus
) {

  const {
    error
  } = await supabaseClient
    .from("anuncios")
    .update({
      ativo: novoStatus,
      atualizado_em:
        new Date().toISOString()
    })
    .eq("id", id);


  if (error) {

    console.error(
      "Erro ao alterar status:",
      error
    );

    alert(
      "Não foi possível alterar o status."
    );

    return;
  }


  await carregarAnuncios();

}


/* =========================================================
   EXCLUIR
========================================================= */

async function excluirAnuncio(id) {

  const confirmar =
    confirm(
      "Tem certeza que deseja excluir esta propaganda?"
    );


  if (!confirmar) return;


  const {
    error
  } = await supabaseClient
    .from("anuncios")
    .delete()
    .eq("id", id);


  if (error) {

    console.error(
      "Erro ao excluir:",
      error
    );

    alert(
      "Não foi possível excluir a propaganda."
    );

    return;
  }


  await carregarAnuncios();

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escapeHTML(valor) {

  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escapeAttribute(valor) {

  return escapeHTML(valor);

}


/* =========================================================
   LOGOUT
========================================================= */

async function sair() {

  if (logoutBtn) {

    logoutBtn.disabled = true;

    logoutBtn.textContent =
      "Saindo...";

  }


  await supabaseClient
    .auth
    .signOut({
      scope: "local"
    });


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


    if (formAnuncio) {

      formAnuncio.addEventListener(
        "submit",
        salvarAnuncio
      );

    }


    if (abrirModalBtn) {

      abrirModalBtn.addEventListener(
        "click",
        () => abrirModal()
      );

    }


    if (fecharModalBtn) {

      fecharModalBtn.addEventListener(
        "click",
        fecharModal
      );

    }


    if (cancelarBtn) {

      cancelarBtn.addEventListener(
        "click",
        fecharModal
      );

    }


    if (atualizarBtn) {

      atualizarBtn.addEventListener(
        "click",
        carregarAnuncios
      );

    }


    if (logoutBtn) {

      logoutBtn.addEventListener(
        "click",
        sair
      );

    }


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
