package org.talend.dataprep.dataset.service.analysis;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Random;

import javax.jms.JMSException;
import javax.jms.Message;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;
import org.talend.dataprep.DistributedLock;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSetMetadata;
import org.talend.dataprep.api.dataset.Quality;
import org.talend.dataprep.dataset.exception.DataSetMessages;
import org.talend.dataprep.dataset.service.Destinations;
import org.talend.dataprep.dataset.store.DataSetContentStore;
import org.talend.dataprep.dataset.store.DataSetMetadataRepository;
import org.talend.dataprep.exception.Exceptions;
import org.talend.datascience.statistics.StatisticsClient;

@Component
public class QualityAnalysis {

    private static final Logger LOGGER = LoggerFactory.getLogger(QualityAnalysis.class);

    @Autowired
    DataSetMetadataRepository repository;

    @Autowired
    DataSetContentStore store;

    @JmsListener(destination = Destinations.QUALITY_ANALYSIS)
    public void indexDataSet(Message message) {
        try {
            String dataSetId = message.getStringProperty("dataset.id"); //$NON-NLS-1$
            DistributedLock datasetLock = repository.createDatasetMetadataLock(dataSetId);
            datasetLock.lock();
            try {
                DataSetMetadata metadata = repository.get(dataSetId);
                if (metadata != null) {
                    if (!metadata.getLifecycle().schemaAnalyzed()) {
                        LOGGER.debug("Schema information must be computed before quality analysis can be performed, ignoring message");
                        return; // no acknowledge to allow re-poll.
                    }
                    for (ColumnMetadata column : metadata.getRow().getColumns()) {
                        Quality quality = column.getQuality();
                        // Computes random quality
                        Random random = new Random();
                        int valid = 50 + random.nextInt(20);
                        int invalid = 25 + random.nextInt(5);
                        int empty = 100 - valid - invalid;
                        quality.setValid(valid);
                        quality.setInvalid(invalid);
                        quality.setEmpty(empty);
                    }

                    try {
                        final File tempFile = File.createTempFile("dataset", metadata.getId());
                        IOUtils.copy(store.get(metadata), new FileOutputStream(tempFile));
                        /*
                         * final SimpleModule module = DataSetMetadataModule.get(true, true, store.get(metadata));
                         * ObjectMapper mapper = new ObjectMapper(); mapper.registerModule(module);
                         * mapper.writer().writeValue(tempFile, metadata); final String value = IOUtils.toString(new
                         * FileInputStream(tempFile)); System.out.println("content: " + value);
                         */
                        System.out.println("-> Analyzing...");
                        final String json = StatisticsClient.doStatistics("local[4]", 0, "2", ";",
                                tempFile.getAbsolutePath(), "json");
                        System.out.println("Analysis: " + json);
                        System.out.println("<- Analyzed.");
                    } catch (IOException e) {
                        e.printStackTrace();
                    }

                    metadata.getLifecycle().qualityAnalyzed(true);
                    repository.add(metadata);
                    message.acknowledge();
                } else {
                    LOGGER.info("Unable to analyze quality of data set #{}: seems to be removed.", dataSetId);
                }
            } finally {
                datasetLock.unlock();
            }
        } catch (JMSException e) {
            throw Exceptions.Internal(DataSetMessages.UNEXPECTED_JMS_EXCEPTION, e);
        }
    }
}
