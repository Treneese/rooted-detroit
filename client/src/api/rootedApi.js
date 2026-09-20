const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

export function getMember(memberId) {
  return request(`/api/members/${memberId}`);
}

export function getHealthProfile(memberId) {
  return request(`/api/members/${memberId}/health-profile`);
}

export function getMemberPlans(memberId) {
  return request(`/api/members/${memberId}/plans`);
}

export async function getResources(category = "") {
  const query = category
    ? `?category=${encodeURIComponent(category)}`
    : "";

  const response = await fetch(
    `${API_BASE_URL}/api/resources${query}`
  );

  if (!response.ok) {
    throw new Error("Unable to load Detroit wellness resources.");
  }

  return response.json();
}

export async function getMapResources() {
  const response = await fetch(
    `${API_BASE_URL}/api/resources/map`
  );

  if (!response.ok) {
    throw new Error("Unable to load resource map.");
  }

  return response.json();
}

export async function getPractitioners() {
  const response = await fetch(
    `${API_BASE_URL}/api/practitioners`
  );

  if (!response.ok) {
    throw new Error("Unable to load practitioners.");
  }

  return response.json();
}

export async function getMemberPractitionerView(memberId = 1) {
  const [member, profile, plans, practitioners] =
    await Promise.all([
      getMember(memberId),
      getHealthProfile(memberId),
      getMemberPlans(memberId),
      getPractitioners(),
    ]);

  return {
    member,
    profile,
    plans,
    practitioners,
  };
}

export async function getMemberProgress(memberId = 1) {
  const response = await fetch(
    `${API_BASE_URL}/api/members/${memberId}/progress`
  );

  if (!response.ok) {
    throw new Error("Unable to load progress.");
  }

  return response.json();
}

export async function createProgressEntry(
  memberId = 1,
  entry
) {
  const response = await fetch(
    `${API_BASE_URL}/api/members/${memberId}/progress`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    }
  );

  if (!response.ok) {
    throw new Error("Unable to save progress.");
  }

  return response.json();
}

export async function getMemberInsights(memberId = 1) {
  const response = await fetch(
    `${API_BASE_URL}/api/members/${memberId}/insights`
  );

  if (!response.ok) {
    throw new Error("Unable to load ROOTED Intelligence.");
  }

  return response.json();
}

export async function askRooted(memberId = 1, question) {
  const response = await fetch(
    `${API_BASE_URL}/api/members/${memberId}/ask`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    }
  );

  if (!response.ok) {
    throw new Error("ROOTED couldn't answer that question.");
  }

  return response.json();
}

export async function createPlanRevision(planId) {
  const response = await fetch(
    `${API_BASE_URL}/api/plans/${planId}/create-revision`,
    {
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.error || "Unable to create plan revision."
    );

    error.data = data;
    throw error;
  }

  return data;
}

export async function approvePlan(planId) {
  return request(`/api/plans/${planId}/approve`, {
    method: "PATCH",
  });
}
