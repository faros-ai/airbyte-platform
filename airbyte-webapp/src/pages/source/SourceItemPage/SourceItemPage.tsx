import React, { Suspense } from "react";
import { useIntl } from "react-intl";
import { Outlet, useParams } from "react-router-dom";

import { ApiErrorBoundary } from "components/common/ApiErrorBoundary";
import { HeadTitle } from "components/common/HeadTitle";
import { ConnectorNavigationTabs } from "components/connector/ConnectorNavigationTabs";
import { ConnectorTitleBlock } from "components/connector/ConnectorTitleBlock";
import { StepsTypes } from "components/ConnectorBlocks";
import LoadingPage from "components/LoadingPage";
import { NextPageHeaderWithNavigation } from "components/ui/PageHeader/NextPageHeaderWithNavigation";

import { useTrackPage, PageTrackingCodes } from "core/services/analytics";
import { FeatureItem, useFeature } from "core/services/features";
import { useAppMonitoringService } from "hooks/services/AppMonitoringService";
import InlineEnrollmentCallout from "packages/cloud/components/experiments/FreeConnectorProgram/InlineEnrollmentCallout";
import { isSourceDefinitionEligibleForFCP } from "packages/cloud/components/experiments/FreeConnectorProgram/lib/model";
import { RoutePaths } from "pages/routePaths";
import { useSourceDefinition } from "services/connector/SourceDefinitionService";
import { ResourceNotFoundErrorBoundary } from "views/common/ResourceNotFoundErrorBoundary";
import { StartOverErrorView } from "views/common/StartOverErrorView";
import { ConnectorDocumentationWrapper } from "views/Connector/ConnectorDocumentationLayout";

import { useGetSourceFromParams } from "../SourceOverviewPage/useGetSourceFromParams";

export const SourceItemPage: React.FC = () => {
  useTrackPage(PageTrackingCodes.SOURCE_ITEM);
  const params = useParams<{ workspaceId: string; "*": StepsTypes | "" | undefined }>();
  const source = useGetSourceFromParams();
  const sourceDefinition = useSourceDefinition(source.sourceDefinitionId);
  const { formatMessage } = useIntl();
  const fcpEnabled = useFeature(FeatureItem.FreeConnectorProgram);

  const breadcrumbBasePath = `/${RoutePaths.Workspaces}/${params.workspaceId}/${RoutePaths.Source}`;

  const breadcrumbsData = [
    {
      label: formatMessage({ id: "sidebar.sources" }),
      to: `${breadcrumbBasePath}/`,
    },
    { label: source.name },
  ];

  const { trackError } = useAppMonitoringService();

  return (
    <ResourceNotFoundErrorBoundary errorComponent={<StartOverErrorView />} trackError={trackError}>
      <ConnectorDocumentationWrapper>
        <HeadTitle titles={[{ id: "admin.sources" }, { title: source.name }]} />
        <NextPageHeaderWithNavigation breadcrumbsData={breadcrumbsData}>
          <ConnectorTitleBlock connector={source} connectorDefinition={sourceDefinition} />
          {fcpEnabled && isSourceDefinitionEligibleForFCP(sourceDefinition) && <InlineEnrollmentCallout />}
          <ConnectorNavigationTabs connectorType="source" connector={source} id={source.sourceId} />
        </NextPageHeaderWithNavigation>
        <Suspense fallback={<LoadingPage />}>
          <ApiErrorBoundary>
            <Outlet />
          </ApiErrorBoundary>
        </Suspense>
      </ConnectorDocumentationWrapper>
    </ResourceNotFoundErrorBoundary>
  );
};
