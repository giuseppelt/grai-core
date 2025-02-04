import React from "react"
import { gql, useQuery } from "@apollo/client"
import { useParams, useSearchParams } from "react-router-dom"
import NotFound from "pages/NotFound"
import useWorkspace from "helpers/useWorkspace"
import PageContent from "components/layout/PageContent"
import PageHeader from "components/layout/PageHeader"
import PageLayout from "components/layout/PageLayout"
import CommitsList from "components/reports/commit/CommitsList"
import CommitsTable from "components/reports/commit/CommitsTable"
import BranchFilter from "components/reports/filters/BranchFilter"
import ReportBreadcrumbs from "components/reports/ReportBreadcrumbs"
import TypeReportTabs from "components/reports/TypeReportTabs"
import GraphError from "components/utils/GraphError"
import { GetCommits, GetCommitsVariables } from "./__generated__/GetCommits"

export const GET_COMMITS = gql`
  query GetCommits(
    $organisationName: String!
    $workspaceName: String!
    $type: String!
    $owner: String!
    $repo: String!
  ) {
    workspace(organisationName: $organisationName, name: $workspaceName) {
      id
      repository(type: $type, owner: $owner, repo: $repo) {
        id
        owner
        repo
        commits {
          data {
            id
            reference
            title
            created_at
            last_successful_run {
              id
              metadata
            }
            branch {
              id
              reference
            }
            pull_request {
              id
              reference
              title
            }
          }
        }
        branches {
          data {
            id
            reference
          }
        }
      }
    }
  }
`

const Commits: React.FC = () => {
  const { organisationName, workspaceName } = useWorkspace()
  const params = useParams()
  const [searchParams] = useSearchParams()

  const type = params.type ?? ""

  const { loading, error, data } = useQuery<GetCommits, GetCommitsVariables>(
    GET_COMMITS,
    {
      variables: {
        organisationName,
        workspaceName,
        type,
        owner: params.owner ?? "",
        repo: params.repo ?? "",
      },
    }
  )

  if (error) return <GraphError error={error} />
  if (loading) return <PageLayout loading />

  const repository = data?.workspace.repository

  if (!repository) return <NotFound />

  const branchReference = searchParams.get("branch")

  return (
    <PageLayout>
      <PageHeader
        breadcrumbs={<ReportBreadcrumbs type={type} repository={repository} />}
      >
        <TypeReportTabs
          currentTab="commits"
          type={type}
          repository={repository}
        />
      </PageHeader>
      <PageContent>
        <BranchFilter branches={repository.branches.data} />
        {branchReference ? (
          <CommitsList
            type={type}
            repository={repository}
            reference={branchReference}
          />
        ) : (
          <CommitsTable
            commits={repository.commits.data}
            type={type}
            repository={repository}
          />
        )}
      </PageContent>
    </PageLayout>
  )
}

export default Commits
